import axios from 'axios';

const LOGOUT_API = 'http://127.0.0.1:8000/apis/logout/';
import { getCookie } from './cookies';

export const logout = async () => {
  try {
    const csrfToken = getCookie('csrftoken');
    const response = await axios.post(
      LOGOUT_API,
      {},
      {
        withCredentials: true, // Required to send session cookies
        headers: {
            'X-CSRFToken': csrfToken!,
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
