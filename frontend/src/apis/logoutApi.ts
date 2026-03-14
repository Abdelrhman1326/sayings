import axios from 'axios';
import { API_BASE } from './apiConfig';
import { getCSRF } from './csrf';

const LOGOUT_API = `${API_BASE}/logout/`;

export const logout = async () => {
  try {
    const csrfToken = await getCSRF();

    if (!csrfToken) {
      throw new Error('Failed to get CSRF token');
    }

    const response = await axios.post(
      LOGOUT_API,
      {},
      {
        headers: {
            'X-CSRFToken': csrfToken,
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