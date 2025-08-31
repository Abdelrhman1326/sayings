import axios from "axios";
import { getCookie } from "./cookies";

export const publish = async ({ text, genres }: { text: string; genres: string[] }) => {
    try {
        const csrfToken = getCookie("csrftoken");

        const response = await axios.post(
            "/apis/community_quotes/publish/",
            {
                quote_text: text,
                quote_genres: genres,
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
        // Axios errors have `error.response` with useful info
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