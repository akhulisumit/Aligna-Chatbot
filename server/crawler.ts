import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { ScrapedData } from '../shared/schema'; // Assuming ScrapedData is defined in shared/schema.ts

interface CrawlerConfig {
  url: string;
  selectors: {
    itemContainer: string;
    title: string;
    price: string;
    // Add more selectors as needed
  };
  userAgent?: string;
  timeout?: number;
  retries?: number;
  retryDelayMs?: number;
}

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000; // 1 second

/**
 * Fetches HTML content from a given URL with retries and timeout.
 * @param url The URL to fetch.
 * @param config Crawler configuration.
 * @returns The HTML content as a string, or null if fetching failed after retries.
 */
async function fetchHtml(url: string, config: CrawlerConfig): Promise<string | null> {
  const userAgent = config.userAgent || DEFAULT_USER_AGENT;
  const timeout = config.timeout || DEFAULT_TIMEOUT_MS;
  const retries = config.retries === undefined ? DEFAULT_RETRIES : config.retries;
  const retryDelayMs = config.retryDelayMs || DEFAULT_RETRY_DELAY_MS;

  for (let i = 0; i <= retries; i++) {
    console.log(`[Crawler] Attempt ${i + 1} to fetch: ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log(`[Crawler] HTTP Status for ${url}: ${response.status}`);

      if (!response.ok) {
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          console.error(`[Crawler ERROR] Client-side error (${response.status}) fetching ${url}. Not retrying.`);
          return null; // Don't retry client errors (except 429 Too Many Requests)
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.text();
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(`[Crawler ERROR] Fetching ${url} failed: ${error.message}`);
      if (error.name === 'AbortError') {
        console.error(`[Crawler ERROR] Request to ${url} timed out after ${timeout}ms.`);
      }

      if (i < retries) {
        console.warn(`[Crawler] Retrying ${url} in ${retryDelayMs / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs * Math.pow(2, i))); // Exponential backoff
      } else {
        console.error(`[Crawler ERROR] Max retries reached for ${url}. Giving up.`);
      }
    }
  }
  return null;
}

/**
 * Parses HTML content using Cheerio and extracts structured data.
 * @param html The HTML content to parse.
 * @param selectors CSS selectors to use for extraction.
 * @returns An array of ScrapedData objects.
 */
function parseHtml(html: string, selectors: CrawlerConfig['selectors']): ScrapedData[] {
  const $ = cheerio.load(html);
  const scrapedItems: ScrapedData[] = [];

  try {
    $(selectors.itemContainer).each((_i, el) => {
      const titleElement = $(el).find(selectors.title);
      const priceElement = $(el).find(selectors.price);

      const title = titleElement.text().trim();
      const priceText = priceElement.text().trim().replace(/[^0-9.]/g, ''); // Basic cleaning for price
      const price = parseFloat(priceText);

      if (title && !isNaN(price)) {
        scrapedItems.push({
          title,
          price,
          // Add other fields as per ScrapedData schema
          // For demonstration, adding a timestamp
          scrapedAt: new Date().toISOString()
        });
      } else {
        console.warn(`[Crawler WARNING] Skipping item due to missing title or invalid price: Title='${title}', PriceText='${priceText}'`);
      }
    });
  } catch (parseError: any) {
    console.error(`[Crawler ERROR] Failed to parse HTML: ${parseError.message}`);
    return [];
  }

  return scrapedItems;
}

/**
 * Main function to crawl a website, fetch HTML, parse it, and return structured data.
 * @param config The configuration for the crawler.
 * @returns An array of ScrapedData objects, or an empty array if crawling failed.
 */
export async function crawlWebsite(config: CrawlerConfig): Promise<ScrapedData[]> {
  console.log(`[Crawler] Starting crawl for: ${config.url}`);
  const html = await fetchHtml(config.url, config);

  if (!html) {
    console.error(`[Crawler ERROR] Could not retrieve HTML for ${config.url}. Aborting crawl.`);
    return [];
  }

  const data = parseHtml(html, config.selectors);
  console.log(`[Crawler] Successfully scraped ${data.length} items from ${config.url}`);
  return data;
}
