import axios from 'axios';
import { getCookie } from './cookies';


interface PaginationParameters {
    limit?: number;   // default 50
    page?: number;    // default 1
}

/**
 * Fetches a paginated, randomly shuffled list of all community quotes.
 * * NOTE: The URL '/community_quotes/community/' is used exactly as requested,
 * but the function name reflects the actual view (ShuffledCommunityQuotesView).
 */
export const fetchShuffledCommunityQuotes = async (params: PaginationParameters) => {
    try {
        const csrfToken = getCookie('csrftoken');

        const response = await axios.get("/community_quotes/community/", {
            params: {
                limit: params.limit || 50,
                page: params.page || 1,
            },
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const apiError = error.response?.data?.detail;
            throw new Error(apiError || 'Failed to fetch shuffled community quotes.');
        }
        throw new Error('An unexpected network error occurred.');
    }
};