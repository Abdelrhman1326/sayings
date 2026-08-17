import axios from 'axios';

// Centralized API configuration
// VITE_API_BASE_URL should be set per-environment (local/.env, Vercel dashboard, etc.).
// If it's not set — e.g. a preview deploy where the env var was forgotten — we fall back
// to the production backend instead of silently resolving to a same-origin relative path.
const PROD_API_URL = 'https://abdelrhmanmo-sayings-api.hf.space';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || PROD_API_URL;

if (!import.meta.env.VITE_API_BASE_URL) {
    console.warn('[apiConfig] VITE_API_BASE_URL not set — falling back to', PROD_API_URL);
}

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
        // Don't attach token to auth endpoints
        const excludedUrls = ['/login/', '/signup/'];
        const isExcluded = excludedUrls.some(url => config.url?.includes(url));

        if (!isExcluded) {
            const token = getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Include credentials for any fallback cookie-based auth
axios.defaults.withCredentials = true;