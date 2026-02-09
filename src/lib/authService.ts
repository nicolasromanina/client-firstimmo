import api from './api';
import type { ProfileResponse } from './types';

// ===== Auth Service =====
export const authService = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    const authUrl = import.meta.env.VITE_AUTH_URL || 'http://localhost:8080';
    window.location.href = `${authUrl}/connexion`;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
