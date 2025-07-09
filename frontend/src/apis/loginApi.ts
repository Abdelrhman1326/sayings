import axios from 'axios';
import { getCookie } from './cookies';

const LOGINAPI = 'http://127.0.0.1:8000/apis/login/';

export const login = async (loginData: any) => {
  try {
    const csrfToken = getCookie('csrftoken');

    const response = await axios.post(
      LOGINAPI,
      loginData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      }
    );

    return response.data;

  } catch (error: any) {
    // Extract meaningful error message from Django
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;

      if (data?.detail) {
        throw new Error(data.detail); // e.g., "Invalid username or password"
      }

      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const messages = data[firstKey];
        if (Array.isArray(messages)) {
          throw new Error(messages[0]); // field-level message
        }
      }

      throw new Error('Login failed');
    }

    // fallback error
    throw new Error('Unexpected error occurred');
  }
};
