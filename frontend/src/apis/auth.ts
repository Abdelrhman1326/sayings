import axios from 'axios';
import { API_BASE } from './apiConfig';

interface AuthResult {
  authenticated: boolean;
  user?: {
    id: number
    username: string;
    email: string;
  }
  csrfToken?: string;
}

export const getAuth = async () => {
  const res = await axios.get(`${API_BASE}/auth/`, {
    withCredentials: true,
  });
  const data = res.data as AuthResult;
  if (data.csrfToken) {
    document.cookie = `csrftoken=${data.csrfToken}; path=/; samesite=lax`;
  }
  return data;
};