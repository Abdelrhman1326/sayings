import axios from "axios";
import { getCookie } from "./cookies";

export const deletePublishedQuote = async (quoteId: number) => {
    try {
        const csrfToken = getCookie("csrftoken");

        const response = await axios.delete(
            `/apis/community_quotes/delete/${quoteId}/`,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
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
