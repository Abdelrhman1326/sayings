import axios from 'axios';

export interface Quote {
  id: number;
  quote_text: string;
  author: string;
  tags: string[];
}

export const getRandomQuote = async (): Promise<Quote> => {
  try {
    const response = await axios.get<Quote>('/apis/quotes/random_quote/', { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching random quote:', error);
    throw error;
  }
};