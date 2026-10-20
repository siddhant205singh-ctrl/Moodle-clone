import axios from 'axios';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,   // send the httpOnly refresh cookie on every request
});

/* ── Request interceptor — attach access token from memory ── */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Response interceptor — silent token refresh on 401 ── */
let isRefreshing  = false;           // prevents multiple simultaneous refresh calls
let refreshQueue  = [];              // requests waiting for the new token

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else       resolve(token);
  });
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,  // pass through successful responses
  async (error) => {
    const original = error.config;

    // Only intercept 401s that haven't already been retried,
    // and skip the /auth/refresh and /auth/login endpoints themselves.
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        // POST /auth/refresh — sends httpOnly cookie automatically
        const baseURL = import.meta.env.VITE_API_URL || '/api';
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.accessToken;

        // Store in memory via the callback set up by AuthContext
        if (typeof _setAccessToken === 'function') _setAccessToken(newToken);

        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear user state and let the app redirect to login
        if (typeof _onRefreshFailed === 'function') _onRefreshFailed();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ── Callbacks registered by AuthContext so the interceptor can update state ── */
let _setAccessToken  = null;
let _onRefreshFailed = null;

export function registerAuthCallbacks(setAccessToken, onRefreshFailed) {
  _setAccessToken  = setAccessToken;
  _onRefreshFailed = onRefreshFailed;
}

/* ── Helper to read the current access token from memory ── */
let _getAccessToken = () => null;
export function registerGetAccessToken(fn) { _getAccessToken = fn; }
function getAccessToken() { return _getAccessToken(); }

export default api;
