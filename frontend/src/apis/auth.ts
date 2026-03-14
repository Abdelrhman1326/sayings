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
  try {
    const res = await axios.get(`${API_BASE}/auth/`);
    return res.data as AuthResult;
  } catch (error) {
    // If auth check fails, return not authenticated
    return { authenticated: false } as AuthResult;
  }
};