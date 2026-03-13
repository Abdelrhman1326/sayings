import axios from "axios";
import { API_BASE } from './apiConfig';

export const getQuoteGenres = async () => {
  try {
    const response = await axios.get(`${API_BASE}/quotes/listgenres/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
        error.response?.statusText ||
        "Request failed"
      );
    }
    throw new Error(error.message || "Unexpected error occurred");
  }
};