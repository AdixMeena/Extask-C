// The one axios instance every API call goes through.
import axios from 'axios';
import { AUTH_LOGOUT_EVENT, tokenStore } from './tokenStore.js';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const tokens = tokenStore.get();
  if (tokens?.accessToken) config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  return config;
});

// Supabase access tokens expire after about an hour. When a call fails with 401 we try ONE
// silent refresh and replay the request. `refreshing` makes parallel failures share one refresh.
let refreshing = null;

async function refreshTokens() {
  const tokens = tokenStore.get();
  if (!tokens?.refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: tokens.refreshToken });
  tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

const isAuthCall = (url = '') => /^\/auth\/(login|register|refresh)/.test(url);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && config && !config._retried && !isAuthCall(config.url) && tokenStore.get()?.refreshToken) {
      config._retried = true;
      try {
        refreshing = refreshing || refreshTokens().finally(() => (refreshing = null));
        const token = await refreshing;
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT)); // AuthContext listens and logs out
      }
    }
    return Promise.reject(error);
  }
);

export default api;
