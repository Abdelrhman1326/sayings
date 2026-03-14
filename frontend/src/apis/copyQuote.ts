import axios from "axios";
import { API_BASE } from './apiConfig';

export const copyQuote = async (quote_id: number) => {
    try {
        const response = await axios.post(
            `${API_BASE}/quotes/copy_quote/${quote_id}/`,
            {}
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error copying quote:", error.response?.data);
            throw new Error(error.response?.data?.error || "Failed to copy quote");
        } else if (error instanceof Error) {
            console.error("Error", error.message);
            throw new Error(error.message || "An unexpected error occurred");
        }
        throw new Error("An unexpected error occurred");
    }
};