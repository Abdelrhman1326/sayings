import axios from 'axios';
import { getCookie } from './cookies';

export const saveQuote = async (quote_id: number) => {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await axios.post(
            `/apis/quotes/save_quote/${quote_id}/`,
            {},
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            }
        );
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error saving quote:", error.response?.data);
            throw new Error(error.response?.data?.error || 'Failed to save quote');
        } else if (error instanceof Error) {
            console.error('Error', error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
        throw new Error('An unexpected error occurred');
    }
};