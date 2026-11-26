import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unauthorized } from '../utils/httpError.js';

const readToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
};

// Asks Supabase Auth whether this access token is valid (also checks expiry/revocation).
async function resolveUser(token) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id };
}

// Protected routes: 401 unless a valid Bearer token is present. Sets req.user.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) throw unauthorized();
  const user = await resolveUser(token);
  if (!user) throw unauthorized('Your session has expired. Please log in again.');
  req.user = user;
  next();
});

// Public routes that show extra data to a logged-in viewer. A bad token is simply ignored.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (token) req.user = (await resolveUser(token)) || undefined;
  next();
});
