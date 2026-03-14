import axios from 'axios';

// Centralized API configuration
// To switch to a different host (e.g. localhost), edit VITE_API_BASE_URL in your .env file.
// If VITE_API_BASE_URL is empty, it defaults to using the local proxy (/apis).
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE = `${BASE_URL}/apis`;

// JWT token storage
let accessToken: string | null = null;

// Load token from localStorage on initialization
const loadTokenFromStorage = () => {
  const stored = localStorage.getItem('access_token');
  if (stored) {
    accessToken = stored;
  }
};

loadTokenFromStorage();

export const setAccessToken = (token: string) => {
  accessToken = token;
  localStorage.setItem('access_token', token);
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Axios interceptor to add JWT token to requests
axios.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Include credentials for any fallback cookie-based auth
axios.defaults.withCredentials = true;
