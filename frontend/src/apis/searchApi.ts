import axios from 'axios';
import { getCookie } from './cookies';

const SEARCH_API_URL = 'http://127.0.0.1:8000/apis/search_quotes/';

interface SearchParams {
    q: string;
    af: string;
    gf: string[];
}

export const searchQuotes = async (params: SearchParams) => {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await axios.get(SEARCH_API_URL, {
            params: {
                q: params.q,
                af: params.af,
                gf: params.gf
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
            throw new Error(error.response?.data?.detail || 'Search failed');
        }
        throw new Error('An unexpected error occurred');
    }
};
