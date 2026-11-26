// Two kinds of Supabase clients, kept apart on purpose:
//  - supabaseAdmin: service-role key, bypasses row level security. Used for all data access.
//  - createAuthClient(): publishable/anon key, used ONLY to sign users in or refresh sessions.
//    A fresh instance per call means one user's session can never leak into another request.
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Serverless-friendly: never persist sessions or auto-refresh in the background.
const options = { auth: { autoRefreshToken: false, persistSession: false } };

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, options);

export const createAuthClient = () => createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options);
