import axios from 'axios';
import { API_BASE, clearAccessToken } from './apiConfig';

const LOGOUT_API = `${API_BASE}/logout/`;

export const logout = async () => {
  try {
    // Call backend logout endpoint (optional for JWT since logout is client-side)
    await axios.post(
      LOGOUT_API,
      {},
      {
        headers: {
            'Content-Type': 'application/json',
        }
      }
    );
    
    // Clear the access token on client side
    clearAccessToken();
    
    return { message: 'Logged out successfully' };
  } catch (error) {
    // Even if backend call fails, clear the token locally
    clearAccessToken();
    console.error('Logout failed:', error);
    throw new Error('Logout failed');
  }
};