import axios from "axios";
import { getCookie } from "./cookies";
import { API_BASE } from './apiConfig';

export const getPublishedCount = async () => {
    try {
        const csrfToken = getCookie("csrftoken");

        const response = await axios.get(
            `${API_BASE}/users/published/count/`,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
            }
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