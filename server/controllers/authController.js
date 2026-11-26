import { createAuthClient, supabaseAdmin } from '../config/supabase.js';
import { assertValid } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isUniqueViolation, unwrap } from '../utils/db.js';
import { badRequest, conflict, notFound, unauthorized } from '../utils/httpError.js';
import { PRIVATE_PROFILE_COLUMNS } from '../utils/serializers.js';
import { normalizePhone, validateRegister } from '../utils/validators.js';

// Phone-only users still need an email for Supabase Auth; nobody ever receives mail here.
const PHONE_EMAIL_DOMAIN = 'phone.extask.app';

const sessionPayload = (session) => ({
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  expiresAt: session.expires_at,
});

// Uses a throwaway client so this sign-in never touches the shared admin client.
async function signIn(authEmail, password) {
  const { data, error } = await createAuthClient().auth.signInWithPassword({ email: authEmail, password });
  return error || !data.session ? null : data.session;
}

async function findConflicts({ username, email, phone }) {
  const errors = {};
  const check = async (column, value, field, message) => {
    if (!value) return;
    const row = unwrap(await supabaseAdmin.from('profiles').select('id').eq(column, value).maybeSingle());
    if (row) errors[field] = message;
  };
  await Promise.all([
    check('username', username, 'username', 'That username is taken'),
    check('email', email, 'email', 'An account with this email already exists'),
    check('phone', phone, 'phone', 'An account with this phone number already exists'),
  ]);
  return errors;
}

// The login box accepts a username, an email or a phone number.
async function findProfileByIdentifier(identifier) {
  const id = identifier.trim();
  let column = 'username';
  let value = id.toLowerCase();
  if (id.includes('@')) {
    column = 'email';
  } else if (/^[+\d\s-]+$/.test(id)) {
    column = 'phone';
    value = normalizePhone(id);
  }
  if (!value) return null;
  return unwrap(
    await supabaseAdmin
      .from('profiles')
      .select(`auth_email, ${PRIVATE_PROFILE_COLUMNS}`)
      .eq(column, value)
      .maybeSingle()
  );
}

export const register = asyncHandler(async (req, res) => {
  const input = assertValid(validateRegister(req.body));

  const conflicts = await findConflicts(input);
  if (Object.keys(conflicts).length > 0) throw conflict('Please fix the highlighted fields', conflicts);

  const authEmail = input.email || `91${input.phone}@${PHONE_EMAIL_DOMAIN}`;

  // email_confirm: true means no confirmation mail is needed (the project has no OTP/mail flow).
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: authEmail,
    password: input.password,
    email_confirm: true,
  });
  if (createError || !created?.user) {
    if (createError?.code === 'email_exists') throw conflict('An account with these details already exists');
    console.error('[auth] createUser failed', createError);
    throw badRequest(createError?.message || 'Could not create the account');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: created.user.id,
      name: input.name,
      username: input.username,
      email: input.email,
      phone: input.phone,
      auth_email: authEmail,
    })
    .select(PRIVATE_PROFILE_COLUMNS)
    .single();

  if (profileError) {
    // Keep auth.users and profiles in sync: undo the auth user if the profile row failed.
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    if (isUniqueViolation(profileError)) throw conflict('That username, email or phone is already in use');
    console.error('[auth] profile insert failed', profileError);
    throw badRequest('Could not create the profile');
  }

  const session = await signIn(authEmail, input.password);
  if (!session) throw unauthorized('Account created, but automatic login failed. Please log in.');
  res.status(201).json({ ...sessionPayload(session), user: profile });
});

export const login = asyncHandler(async (req, res) => {
  const identifier = typeof req.body.identifier === 'string' ? req.body.identifier : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!identifier.trim() || !password) {
    throw badRequest('Enter your username, email or phone, and your password');
  }

  const found = await findProfileByIdentifier(identifier);
  // Same message for "no such user" and "wrong password" so accounts cannot be probed.
  const invalid = unauthorized('Wrong username, email, phone or password');
  if (!found) throw invalid;

  const session = await signIn(found.auth_email, password);
  if (!session) throw invalid;

  const { auth_email: _internal, ...profile } = found;
  res.json({ ...sessionPayload(session), user: profile });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = typeof req.body.refreshToken === 'string' ? req.body.refreshToken : '';
  if (!refreshToken) throw badRequest('refreshToken is required');

  const { data, error } = await createAuthClient().auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) throw unauthorized('Your session has expired. Please log in again.');
  res.json(sessionPayload(data.session));
});

export const me = asyncHandler(async (req, res) => {
  const user = unwrap(
    await supabaseAdmin.from('profiles').select(PRIVATE_PROFILE_COLUMNS).eq('id', req.user.id).maybeSingle()
  );
  if (!user) throw notFound('Profile not found');
  res.json({ user });
});
