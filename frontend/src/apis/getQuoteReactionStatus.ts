import axios from 'axios';
import { API_BASE } from './apiConfig';

export const getQuoteReactionStatus = async (quote_id: number) => {
    try {
        const response = await axios.get(`${API_BASE}/quotes/${quote_id}/reaction-status/`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error getting reaction status:", error.response?.data);
            throw new Error(error.response?.data?.error || 'Failed to get reaction status');
        } else if (error instanceof Error) {
            console.error('Error', error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
        throw new Error('An unexpected error occurred');
    }
}