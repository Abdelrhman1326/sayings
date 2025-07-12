import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/apis';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

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