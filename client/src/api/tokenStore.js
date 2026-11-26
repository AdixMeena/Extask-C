// Keeps the session tokens in localStorage. Wrapped in try/catch because storage can be
// blocked (private mode, strict browser settings) and the app must still load.
const KEY = 'extask.session';
export const AUTH_LOGOUT_EVENT = 'extask:logout';

export const tokenStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  },
  set(tokens) {
    try {
      localStorage.setItem(KEY, JSON.stringify(tokens));
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
