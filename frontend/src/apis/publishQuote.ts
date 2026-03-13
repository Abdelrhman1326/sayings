import axios from "axios";
import { getCookie } from "./cookies";
import { API_BASE } from './apiConfig';

export const publish = async ({ text, genre }: { text: string; genre: string }) => {
    try {
        const csrfToken = getCookie("csrftoken");

        const response = await axios.post(
            `${API_BASE}/community_quotes/publish/`,
            {
                quote_genre: genre,
                quote_text: text,
            },
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
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
