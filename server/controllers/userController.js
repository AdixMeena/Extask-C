import { supabaseAdmin } from '../config/supabase.js';
import { assertValid } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/db.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { PRIVATE_PROFILE_COLUMNS, PUBLIC_PROFILE_COLUMNS } from '../utils/serializers.js';
import { validateProfileUpdate } from '../utils/validators.js';

export const getUser = asyncHandler(async (req, res) => {
  const user = unwrap(
    await supabaseAdmin.from('profiles').select(PUBLIC_PROFILE_COLUMNS).eq('id', req.params.id).maybeSingle()
  );
  if (!user) throw notFound('User not found');
  res.json({ user });
});

// id_verified is deliberately NOT editable here: it is switched on by hand in the Supabase
// Table Editor after the submitted ID details are checked (there is no admin panel yet).
export const updateMe = asyncHandler(async (req, res) => {
  const changes = assertValid(validateProfileUpdate(req.body));
  if (Object.keys(changes).length === 0) throw badRequest('Nothing to update');

  const user = unwrap(
    await supabaseAdmin.from('profiles').update(changes).eq('id', req.user.id).select(PRIVATE_PROFILE_COLUMNS).single()
  );
  res.json({ user });
});
