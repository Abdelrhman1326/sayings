import axios from 'axios';
import { API_BASE } from './apiConfig';

const SEARCH_API_URL = `${API_BASE}/quotes/search_quotes/`;

interface SearchParams {
    q: string;
    af: string;
    gf: string[];
    limit?: number;   // default 50
    page?: number;    // default 1
}

export const searchQuotes = async (params: SearchParams) => {
    try {
        const response = await axios.get(SEARCH_API_URL, {
            params: {
                q: params.q,
                af: params.af,
                gf: params.gf,
                limit: params.limit || 50,
                page: params.page || 1,
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