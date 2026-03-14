import axios from "axios";
import { API_BASE } from './apiConfig';

// Cursor info sent to the backend
export interface FeedCursor {
  last_score?: number;
  last_id?: number;
  limit?: number;
}

// Shape of each quote
export interface Quote {
  id: number;
  quote_text: string;
  quote_author: string;
  likes_count: number | null;
  dislikes_count: number | null;
  quote_source: string;
}

// Backend response shape
export interface FeedResponse {
  results: Quote[];
  next_cursor?: FeedCursor;
}

export const getFeed = async (
  cursor: FeedCursor = {}
): Promise<FeedResponse> => {
  try {
    const response = await axios.get(`${API_BASE}/quotes/feed/`, {
      params: cursor, // last_score, last_id, limit if provided
    });

    return response.data as FeedResponse;
  } catch (error: any) {
    console.error("Error fetching feed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch feed");
  }
};
