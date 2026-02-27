import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs d'authentification
// NE PAS rediriger ici — laisser useAuth gérer la redirection
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

// Fonction helper pour les uploads de fichiers (FormData)
export const uploadFile = async (url: string, formData: FormData, method: 'PUT' | 'POST' = 'POST') => {
  const token = localStorage.getItem('token');
  const headers: any = {
    Authorization: token ? `Bearer ${token}` : '',
    // Ne pas définir Content-Type pour FormData - laisser le navigateur gérer
  };
  
  return axios.request({
    method,
    url: `${API_URL}${url}`,
    data: formData,
    headers,
  });
};

export default api;
