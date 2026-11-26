import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints.js';
import { AUTH_LOGOUT_EVENT, tokenStore } from '../api/tokenStore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token exists we must check it before deciding what to render (avoids a login-page flash).
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  useEffect(() => {
    if (!tokenStore.get()) return undefined;
    let alive = true;
    authApi
      .me()
      .then(({ user: me }) => alive && setUser(me))
      .catch(() => tokenStore.clear())
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // The axios client fires this when a token refresh fails.
  useEffect(() => {
    const onForcedLogout = () => setUser(null);
    window.addEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
  }, []);

  const startSession = useCallback((payload) => {
    tokenStore.set({ accessToken: payload.accessToken, refreshToken: payload.refreshToken });
    setUser(payload.user);
    return payload.user;
  }, []);

  const login = useCallback(
    async (identifier, password) => startSession(await authApi.login({ identifier, password })),
    [startSession]
  );
  const register = useCallback(async (form) => startSession(await authApi.register(form)), [startSession]);
  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
