import axios from 'axios';
import { getCookie } from './cookies';

const SIGNUPAPI = 'http://127.0.0.1:8000/apis/signup/';

export const signup = async (signupData: any) => {
  try {
    const csrfToken = getCookie('csrftoken');

    const response = await axios.post(
      SIGNUPAPI,
      signupData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      }
    );

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
