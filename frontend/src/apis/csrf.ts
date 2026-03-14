import axios from 'axios';
import { API_BASE } from './apiConfig';

const CSRFAPI = `${API_BASE}/csrf/`;

export const getCSRF = async () => {
  try {
    const response = await axios.get(CSRFAPI);
    return response.data.csrfToken;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
};