import axios from 'axios';
import { API_BASE } from './apiConfig';
import { getCookie } from './cookies';
import { getCSRF } from './csrf';

const LOGOUT_API = `${API_BASE}/logout/`;

export const logout = async () => {
  try {
    // Ensure fresh CSRF cookie is set
    await getCSRF();

    const csrfToken = getCookie('csrftoken');
    const response = await axios.post(
      LOGOUT_API,
      {},
      {
        withCredentials: true, // Required to send session cookies
        headers: {
            'X-CSRFToken': csrfToken || '',
            'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error);
    throw new Error('Logout failed');
  }
};