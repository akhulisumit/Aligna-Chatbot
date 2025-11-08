import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Interface for the data extracted from a crawled page.
 */
export interface CrawledData {
  url: string;
  title: string | null;
  h1s: string[];
  extractedAt: string;
  error?: string;
}

/**
 * Fetches, parses, and extracts data from a given URL.
 * It handles network requests, content parsing, and basic error management.
 * @param url The URL to crawl.
 * @returns A promise resolving to CrawledData, including any error encountered.
 */
export async function crawlPage(url: string): Promise<CrawledData> {
  const extractedData: CrawledData = {
    url,
    title: null,
    h1s: [],
    extractedAt: new Date().toISOString(),
  };

  try {
    console.log(`Attempting to crawl: ${url}`);
    const response = await axios.get(url, {
      timeout: 15000, // 15 seconds timeout for network requests
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (response.status !== 200) {
      extractedData.error = `Failed to fetch URL with status: ${response.status} ${response.statusText}`;
      console.error(extractedData.error);
      return extractedData;
    }

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract title
    extractedData.title = $('title').text() || null;

    // Extract all h1 tags
    $('h1').each((_i, element) => {
      const text = $(element).text().trim();
      if (text) {
        extractedData.h1s.push(text);
      }
    });

    console.log(`Successfully crawled ${url}. Title: "${extractedData.title || 'N/A'}", H1s found: ${extractedData.h1s.length}`);
    return extractedData;

  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      extractedData.error = `Network error crawling ${url}: ${error.message}`;
      if (error.response) {
        extractedData.error += ` (Status: ${error.response.status})`;
      } else if (error.request) {
        extractedData.error += ` (No response received, URL might be unreachable or timed out)`;
      }
    } else {
      extractedData.error = `An unexpected error occurred while crawling ${url}: ${error.message}`;
    }
    console.error(`Error during crawl of ${url}:`, extractedData.error, error);
    return extractedData;
  }
}

/**
 * Placeholder function for persisting crawled data.
 * This function would interact with your database or other storage mechanism.
 * @param data The CrawledData object to save.
 * @returns A promise resolving to true if save was successful, false otherwise.
 */
export async function saveData(data: CrawledData): Promise<boolean> {
  try {
    // In a real application, you would interact with your ORM/ODM or database client here.
    // Example: await database.insert('crawled_pages', data);
    console.log(`Saving data for ${data.url}... (Mock save)`);
    // Simulate a database operation
    await new Promise(resolve => setTimeout(resolve, 100)); 
    console.log(`Data for ${data.url} successfully saved (Mock save).`);
    return true;
  } catch (error: any) {
    console.error(`Error saving data for ${data.url}: ${error.message}`);
    return false;
  }
}

// To use this module, ensure you have the necessary packages installed:
// npm install axios cheerio @types/cheerio
