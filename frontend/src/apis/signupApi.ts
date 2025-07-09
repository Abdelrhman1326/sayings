import axios from 'axios';

const SIGNUPAPI = 'http://127.0.0.1:8000/apis/signup/';

export const signup = async (signupData: any) => {
  try {
    const response = await axios.post(SIGNUPAPI, signupData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;

      // Handle field-level validation errors (e.g., email, username, etc.)
      if (data && typeof data === 'object') {
        const firstField = Object.keys(data)[0];
        const messages = data[firstField];

        if (Array.isArray(messages)) {
          throw new Error(`${messages[0]}`);
        }
      }

      // Handle top-level errors like {"detail": "..."} or {"message": "..."}
      const errorMsg =
        data?.detail ||
        data?.message ||
        error.message ||
        'Unknown signup error';

      throw new Error(errorMsg);
    }

    // Non-Axios error fallback
    throw new Error('Unexpected error occurred');
  }
};
