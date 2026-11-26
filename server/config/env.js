// Loads and validates environment variables once, so the rest of the code
// can import a clean `env` object instead of touching process.env directly.
import 'dotenv/config';

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // Failing loudly at startup is friendlier than a cryptic error on the first request.
  throw new Error(
    `Missing environment variables: ${missing.join(', ')}. ` +
      'Copy server/.env.example to server/.env and fill it in.'
  );
}

export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URLS: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
  isProd: process.env.NODE_ENV === 'production',
};
