import axios from 'axios';
import { API_BASE } from './apiConfig';

export const dislikeQuote = async (quote_id: number, isCommunity: boolean = false): Promise<any> => {
    const URL = isCommunity
        ? `${API_BASE}/community_quotes/${quote_id}/dislike/`
        : `${API_BASE}/quotes/${quote_id}/dislike/`;

    try {
        const response = await axios.post(URL, null);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error disliking quote:", error.response?.status, error.response?.data);
            throw new Error(error.response?.data?.error || 'Failed to dislike quote');
        } else if (error instanceof Error) {
            console.error('Error', error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
        throw new Error('An unexpected error occurred');
    }
};
