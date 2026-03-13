import axios from 'axios';
import { API_BASE } from './apiConfig';

interface AuthResult {
  authenticated: boolean;
  user?: {
    id: number
    username: string;
    email: string;
  }
}

export const getAuth = async () => {
  const res = await axios.get(`${API_BASE}/auth/`, {
    withCredentials: true,
  });
  return res.data as AuthResult;
};