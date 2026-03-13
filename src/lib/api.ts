import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const isLocalHost = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');

const shouldUseCookieOnlyAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !isLocalHost(window.location.hostname);
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (!shouldUseCookieOnlyAuth()) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Decode token to log user ID
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          console.log('[API] Request with userId:', decoded.id, '| URL:', config.url);
        } catch (e) {
          console.log('[API] Could not decode token');
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const uploadFile = async (url: string, formData: FormData, method: 'PUT' | 'POST' = 'POST') => {
  const headers: any = {};

  if (!shouldUseCookieOnlyAuth()) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return axios.request({
    method,
    url: `${API_URL}${url}`,
    data: formData,
    headers,
    withCredentials: true,
  });
};

export default api;