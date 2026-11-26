// One error type for "expected" failures. The error handler turns it into a JSON response.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details; // optional per-field messages for form validation
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const unauthorized = (message = 'Please log in to continue') => new HttpError(401, message);
export const forbidden = (message = 'You are not allowed to do that') => new HttpError(403, message);
export const notFound = (message = 'Not found') => new HttpError(404, message);
export const conflict = (message, details) => new HttpError(409, message, details);
