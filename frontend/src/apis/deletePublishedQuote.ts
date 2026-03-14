import axios from "axios";
import { getCSRFToken } from "./csrfToken";
import { API_BASE } from './apiConfig';

export const deletePublishedQuote = async (quoteId: number) => {
    try {
        const csrfToken = getCSRFToken();

        const response = await axios.delete(
            `${API_BASE}/community_quotes/delete/${quoteId}/`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken || '',
                },
                validateStatus: (status) => status >= 200 && status < 300,
            }
        );

        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(
                error.response.data?.detail ||
                error.response.data?.error ||
                error.response.statusText ||
                "Request failed"
            );
        }
        throw new Error(error.message || "Unexpected error occurred");
    }
};
