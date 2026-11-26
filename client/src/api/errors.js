// Turns axios errors into text and per-field messages for forms.
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const fromServer = err?.response?.data?.error?.message;
  if (fromServer) return fromServer;
  if (err?.request && !err?.response) return 'Cannot reach the server. Check your connection and try again.';
  return fallback;
}

export const getFieldErrors = (err) => err?.response?.data?.error?.details || {};
