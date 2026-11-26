import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Every error ends up here, so the API always answers with the same JSON shape:
// { error: { message, details? } }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON' } });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  // Never leak internals for unexpected errors in production.
  const message = status >= 500 && env.isProd ? 'Something went wrong on our side' : err.message;
  return res.status(status).json({ error: { message, details: err.details } });
}
