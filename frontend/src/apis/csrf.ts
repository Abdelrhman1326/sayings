import axios from 'axios';
import { API_BASE } from './apiConfig';

const CSRFAPI = `${API_BASE}/csrf/`;

export const getCSRF = async () => {
  try {
    const response = await axios.get(CSRFAPI, {
      withCredentials: true,
    });
    const token = response.data.csrfToken;
    if (token) {
        // Manually set the cookie on the frontend domain so getCookie can read it
        // This is a workaround for cross-domain issues when no proxy is used
        document.cookie = `csrftoken=${token}; path=/; samesite=lax`;
    }
    return token;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
};