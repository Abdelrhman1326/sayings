import axios from "axios";
import { API_BASE } from './apiConfig';

export const getSavedQuotes = async (page = 1, limit = 50) => {
    try {
        const response = await axios.get(
            `${API_BASE}/quotes/saved_quotes/`,
            {
                params: {
                    page: page,
                    limit: limit,
                },
            }
        );
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error getting quotes:", error.response?.data);
            throw new Error(
                error.response?.data?.error || "Failed to get saved quotes"
            );
        } else if (error instanceof Error) {
            console.error("Error", error.message);
            throw new Error(error.message || "An unexpected error occurred");
        }
        throw new Error("An unexpected error occurred");
    }
};