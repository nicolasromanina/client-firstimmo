import api from './api';
import type { ProfileResponse } from './types';

const isLocalHost = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');

const shouldUseCookieOnlyAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !isLocalHost(window.location.hostname);
};

export const authService = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8080';
    window.location.href = `${authUrl}/connexion`;
  },

  getToken: (): string | null => {
    if (shouldUseCookieOnlyAuth()) return null;
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    // Rely on backend session cookie and /users/me validation.
    // localStorage token is kept only as legacy fallback.
    return true;
  },
};

export default authService;
