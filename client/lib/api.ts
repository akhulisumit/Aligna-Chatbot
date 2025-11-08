import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * Initiates a web crawling task on the server for a given URL.
 * @param url The URL to crawl.
 * @returns A promise that resolves with the server's response upon initiating the crawl.
 * @throws Throws an error if the API call fails.
 */
export const initiateCrawl = async (url: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/crawl`, { url });
    return response.data;
  } catch (error) {
    console.error('Failed to initiate crawl:', error);
    throw error; // Re-throw to allow calling components to handle the error
  }
};
