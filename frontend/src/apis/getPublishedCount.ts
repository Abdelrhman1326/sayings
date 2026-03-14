import axios from "axios";
import { API_BASE } from './apiConfig';

export const getPublishedCount = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/users/published/count/`
        );

        return response.data.published_quote_count;
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