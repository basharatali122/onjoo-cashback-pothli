import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
});

let _cachedToken = null, _tokenExpiry = 0, _refreshPromise = null;

async function getFreshToken(user) {
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiry - 60000) return _cachedToken;
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = user.getIdToken(true).then(token => {
    _cachedToken = token; _tokenExpiry = now + 55 * 60 * 1000;
    _refreshPromise = null; return token;
  }).catch(err => { _refreshPromise = null; throw err; });
  return _refreshPromise;
}

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try { config.headers.Authorization = `Bearer ${await getFreshToken(user)}`; } catch (_) {}
  }
  return config;
});

auth.onIdTokenChanged(() => { _cachedToken = null; _tokenExpiry = 0; _refreshPromise = null; });

api.interceptors.response.use(r => r, async (error) => {
  const orig = error.config;
  if (error.response?.status === 401 && !orig._retried) {
    orig._retried = true; _cachedToken = null; _tokenExpiry = 0;
    const user = auth.currentUser;
    if (user) {
      try {
        orig.headers.Authorization = `Bearer ${await getFreshToken(user)}`;
        return api(orig);
      } catch (_) {}
    }
  }
  return Promise.reject(error);
});

export const accountsAPI = {
  getAll:     (p)       => api.get(`/accounts/${p}`),
  bulkImport: (p, accs) => api.post(`/accounts/${p}/bulk`, { accounts: accs }),
  generate:   (p, opts) => api.post(`/accounts/${p}/generate`, opts),
  bulkDelete: (p, ids)  => api.delete(`/accounts/${p}/bulk/delete`, { data: { ids } }),
  clearAll:   (p)       => api.delete(`/accounts/${p}/all/clear`),
};

export const processingAPI = {
  start:  (p, opts) => api.post(`/processing/${p}/start`, opts),
  stop:   (p)       => api.post(`/processing/${p}/stop`),
  status: (p)       => api.get(`/processing/${p}/status`),
};

export const proxyAPI = {
  get:       (p)       => api.get(`/proxy/${p}`),
  save:      (p, cfg)  => api.post(`/proxy/${p}`, cfg),
  test:      (p, url)  => api.post(`/proxy/${p}/test`,      { proxyUrl: url }),
  normalize: (p, text) => api.post(`/proxy/${p}/normalize`, { proxyList: text }),
};

export const statsAPI = {
  get: (p) => api.get(`/stats/${p}`),
};

export default api;
