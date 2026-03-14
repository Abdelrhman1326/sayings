import axios from 'axios';

// Centralized API configuration
// To switch to a different host (e.g. localhost), edit VITE_API_BASE_URL in your .env file.
// If VITE_API_BASE_URL is empty, it defaults to using the local proxy (/apis).
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE = `${BASE_URL}/apis`;

// Include credentials (cookies) in all axios requests
axios.defaults.withCredentials = true;
