import axios from 'axios';

export const getLikedQuotes = async (page:number = 1, limit:number = 50) => {
    try {
        const response = await axios.get(
            `/apis/quotes/liked_quotes/`,
                {
                    params: {
                        page: page,
                        limit: limit,
                    },
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error getting quotes:", error.response?.data);
            throw new Error(
                error.response?.data?.error || "Failed to get liked quotes"
            );
        } else if (error instanceof Error) {
            console.error("Error", error.message);
            throw new Error(error.message || "An unexpected error occurred");
        }
        throw new Error("An unexpected error occurred");
    }
}