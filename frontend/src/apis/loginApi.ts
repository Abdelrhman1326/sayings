import axios from 'axios';
import { API_BASE } from './apiConfig';
import { getCSRF } from './csrf';
import { setCSRFToken } from './csrfToken';

const LOGINAPI = `${API_BASE}/login/`;

export const login = async (loginData: any) => {
  try {
    // Step 1: get CSRF token from response
    const csrfToken = await getCSRF();

    if (!csrfToken) {
      throw new Error('Failed to get CSRF token');
    }

    // Step 2: send login request with CSRF token as header
    const response = await axios.post(
        LOGINAPI,
        loginData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
        }
    );

    // Step 3: store CSRF token for subsequent requests
    setCSRFToken(csrfToken);

    return response.data;

  } catch (error: any) {

    // Extract meaningful error message from Django
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;

      if (data?.detail) {
        throw new Error(data.detail);
      }

      if (typeof data === 'object' && data !== null) {
        const firstKey = Object.keys(data)[0];
        const messages = data[firstKey];

        if (Array.isArray(messages)) {
          throw new Error(messages[0]);
        }
      }

      throw new Error('Login failed');
    }

    throw new Error('Unexpected error occurred');
  }
};