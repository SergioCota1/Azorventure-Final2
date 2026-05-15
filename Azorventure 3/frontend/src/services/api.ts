import axios from 'axios';

// Configuração da API
const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE_URL = rawApiBaseUrl
  ? (rawApiBaseUrl.endsWith('/api') ? rawApiBaseUrl : `${rawApiBaseUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;