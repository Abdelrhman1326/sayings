import axios from 'axios';
import { getCookie } from './cookies';

export const saveQuote = async (quote_id: number, isCommunity: boolean = false): Promise<any> => {
    const URL = isCommunity
        ? `/apis/community_quotes/${quote_id}/save/`
        : `/apis/quotes/save_quote/${quote_id}/`;

    try {
        const csrfToken = getCookie('csrftoken');
        const response = await axios.post(URL, null, {  // null for empty body
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error saving quote:", error.response?.status, error.response?.data);
            throw new Error(error.response?.data?.error || 'Failed to save quote');
        } else if (error instanceof Error) {
            console.error('Error', error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
        throw new Error('An unexpected error occurred');
    }
};