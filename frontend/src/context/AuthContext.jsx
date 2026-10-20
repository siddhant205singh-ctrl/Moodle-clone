import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { registerAuthCallbacks, registerGetAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Access token lives in memory only — never written to localStorage (XSS safe).
  const [accessToken, setAccessToken] = useState(null);
  // User starts as null — populated only after the silent refresh confirms the session.
  const [user, setUser] = useState(null);
  // Track whether the initial silent refresh attempt has completed
  const [ready, setReady] = useState(false);

  /* ── Register callbacks so the axios interceptor can update in-memory token ── */
  useEffect(() => {
    registerGetAccessToken(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    registerAuthCallbacks(
      (token) => setAccessToken(token),   // called after a silent refresh succeeds
      () => {                              // called when refresh token is expired
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem('kiet_lms_user');
      }
    );
  }, []);

  /* ── On first load: try a silent refresh to restore the session ── */
  useEffect(() => {
    api.post('/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        // Restore user info from localStorage only after token is confirmed valid
        try {
          const stored = JSON.parse(localStorage.getItem('kiet_lms_user'));
          if (stored) setUser(stored);
        } catch { /* ignore */ }
      })
      .catch(() => {
        // No valid refresh cookie — clear any stale user data
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem('kiet_lms_user');
      })
      .finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── login ── */
  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('kiet_lms_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  /* ── logout ── */
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('kiet_lms_user');
  }, []);

  /* ── silentRefresh (exposed for manual use if needed) ── */
  const silentRefresh = useCallback(async () => {
    const { data } = await api.post('/auth/refresh');
    setAccessToken(data.accessToken);
    return data.accessToken;
  }, []);

  // Don't render children until we know whether the session can be restored.
  // This prevents a flash of the login page on refresh for logged-in users.
  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ token: accessToken, accessToken, user, login, logout, silentRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
