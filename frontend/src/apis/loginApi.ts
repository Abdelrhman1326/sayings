import axios from 'axios';
import { API_BASE, setAccessToken } from './apiConfig';

const LOGINAPI = `${API_BASE}/login/`;

export const login = async (loginData: any) => {
  try {
    const response = await axios.post(
        LOGINAPI,
        loginData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
    );

    // Store access token for subsequent requests
    if (response.data.access) {
      setAccessToken(response.data.access);
    }

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