import axios from "axios";
import { API_BASE } from './apiConfig';

export const publish = async ({ text, genre }: { text: string; genre: string }) => {
    try {
        const response = await axios.post(
            `${API_BASE}/community_quotes/publish/`,
            {
                quote_genre: genre,
                quote_text: text,
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
