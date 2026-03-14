import axios from 'axios';
import { API_BASE, setAccessToken } from './apiConfig';

const SIGNUPAPI = `${API_BASE}/signup/`;

export const signup = async (signupData: any) => {
  try {
    const response = await axios.post(
      SIGNUPAPI,
      signupData,
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
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;

      // Field-level validation error handling
      if (data && typeof data === 'object') {
        const firstField = Object.keys(data)[0];
        const messages = data[firstField];

        if (Array.isArray(messages)) {
          throw new Error(`${messages[0]}`);
        }
      }

      // General error messages
      const errorMsg =
        data?.detail ||
        data?.message ||
        error.message ||
        'Unknown signup error';

      throw new Error(errorMsg);
    }

    // Fallback for unexpected error types
    throw new Error('Unexpected error occurred');
  }
};