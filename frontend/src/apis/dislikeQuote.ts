import axios from 'axios';
import { getCookie } from './cookies';

export const dislikeQuote = async (quote_id: number) => {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await axios.post(`/apis/quotes/${quote_id}/dislike/`, {}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error disliking quote:", error.response?.data);
            throw new Error(error.response?.data?.error || 'Failed to dislike quote');
        } else if (error instanceof Error) {
            console.error('Error', error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
        throw new Error('An unexpected error occurred');
    }
}