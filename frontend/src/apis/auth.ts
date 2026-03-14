import axios from 'axios';
import { API_BASE } from './apiConfig';
import { setCSRFToken } from './csrfToken';

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
  const res = await axios.get(`${API_BASE}/auth/`);
  const data = res.data as AuthResult;
  if (data.csrfToken) {
    setCSRFToken(data.csrfToken);
  }
  return data;
};