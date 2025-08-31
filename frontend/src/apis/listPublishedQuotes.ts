import axios from "axios";
import { getCookie } from "./cookies";

export const getPublishedQuotes = async () => {
    try {
        const csrfToken = getCookie("csrftoken");

        const response = await axios.get(
            "/apis/community_quotes/published/",
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