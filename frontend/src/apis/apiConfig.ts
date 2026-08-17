import axios from 'axios';

// Production API
const BASE_URL = 'https://abdelrhmanmo-sayings-api.hf.space';

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
        // Don't attach token to authentication endpoints
        const excludedUrls = ['/login/', '/signup/'];

        const isExcluded = excludedUrls.some(
            (url) => config.url?.includes(url)
        );

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