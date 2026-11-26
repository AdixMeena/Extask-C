import { HttpError } from './httpError.js';

// Unwraps a supabase-js `{ data, error }` result. Raw database errors are logged for us
// but never sent to the browser (they can leak table and column names).
export function unwrap({ data, error }, message = 'Something went wrong while talking to the database') {
  if (error) {
    console.error('[db]', error);
    throw new HttpError(500, message);
  }
  return data;
}

// Postgres error 23505 = unique constraint violated.
export const isUniqueViolation = (error) => error?.code === '23505';
