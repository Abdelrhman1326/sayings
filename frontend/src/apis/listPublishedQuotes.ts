import axios from "axios";
import { API_BASE } from './apiConfig';

export const getPublishedQuotes = async (page = 1, limit = 50) => {
    try {
        const response = await axios.get(
            `${API_BASE}/community_quotes/published/`,
            {
                params: {
                 page: page,
                 limit: limit,
                },
            }
        );

        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(
                error.response.data?.detail ||
                error.response.statusText ||
                "Request failed"
            );
        }
        throw new Error(error.message || "Unexpected error occurred");
    }
};