import axios from 'axios';
import { API_BASE } from './apiConfig';

export const getUsername = async () => {
    try {
        const response = await axios.get(`${API_BASE}/users/username`);
        return { username: response.data.username, error: null };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error fetching username:", error.response?.data);
            return {
                username: null,
                error: error.response?.data?.error || 'Failed to fetch username'
            };
        } else if (error instanceof Error) {
            console.error("Error:", error.message);
            return { username: null, error: error.message };
        }
        return { username: null, error: 'An unexpected error occurred' };
    }
};