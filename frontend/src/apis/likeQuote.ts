import axios from 'axios';
import { getCSRFToken } from './csrfToken';
import { API_BASE } from './apiConfig';

export const likeQuote = async (quote_id: number, isCommunity: boolean = false) => {
    const URL = isCommunity
        ? `${API_BASE}/community_quotes/${quote_id}/like/`
        : `${API_BASE}/quotes/${quote_id}/like/`;

    try {
        const csrfToken = getCSRFToken();
        const response = await axios.post(URL, {}, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error liking quote:", error.response?.data);
            throw new Error(error.response?.data?.error || 'Failed to like quote');
        } else if (error instanceof Error) {
            console.error('Error', error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
        throw new Error('An unexpected error occurred');
    }
}