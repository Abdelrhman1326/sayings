import axios from 'axios';
import { getCookie } from './cookies';
import { API_BASE } from './apiConfig';

const LOGINAPI = `${API_BASE}/login/`;
const CSRFAPI = `${API_BASE}/csrf/`;

// Get CSRF cookie from backend
const getCSRF = async () => {
  await axios.get(CSRFAPI, {
    withCredentials: true,
  });
};

export const login = async (loginData: any) => {
  try {
    // Step 1: ensure CSRF cookie is set
    await getCSRF();

    // Step 2: read csrftoken from cookie
    const csrfToken = getCookie('csrftoken');

    // Step 3: send login request
    const response = await axios.post(
        LOGINAPI,
        loginData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken || '',
          },
        }
    );

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