import { badRequest, notFound } from '../utils/httpError.js';
import { UUID_RE } from '../utils/validators.js';

// Takes the { value, errors } pair from a validator; returns value or throws a 400 with per-field messages.
export function assertValid({ value, errors }) {
  if (Object.keys(errors).length > 0) {
    throw badRequest('Please fix the highlighted fields', errors);
  }
  return value;
}

// Used with router.param(): a malformed id can never match a row, so answer 404 before touching the DB.
export const uuidParam = (_req, _res, next, value) => {
  if (!UUID_RE.test(value)) return next(notFound('Not found'));
  return next();
};
