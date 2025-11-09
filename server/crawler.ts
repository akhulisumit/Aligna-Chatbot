import axios from 'axios';
import * as cheerio from 'cheerio';

// Define a structure for the data we want to extract from each page
interface CrawledData {
  url: string;
  title: string | null;
  content: string | null;
  links: string[];
  crawledAt: Date;
}

/**
 * A robust web crawler class designed to fetch, parse, and store web content.
 * It includes error handling for network requests, basic content extraction,
 * and a placeholder for data storage.
 */
class Crawler {
  private userAgent: string;
  private maxRetries: number;
  private retryDelayMs: number;
  private timeoutMs: number;
  private crawledPages: CrawledData[]; // Simple in-memory storage for demonstration

  constructor() {
    // Configure the crawler for better resilience and behavior
    this.userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'; // Identify as a common bot
    this.maxRetries = 3; // Number of times to retry a failed network request
    this.retryDelayMs = 2000; // Delay between retries in milliseconds
    this.timeoutMs = 15000; // Timeout for network requests in milliseconds (15 seconds)
    this.crawledPages = []; // Initialize in-memory storage
  }

  /**
   * Fetches the HTML content of a given URL with retry logic and timeouts.
   * @param url The URL to fetch.
   * @param retries The current retry attempt count (internal use).
   * @returns The HTML content as a string, or null if fetching fails after retries.
   */
  private async fetchPage(url: string, retries: number = 0): Promise<string | null> {
    try {
      console.log(`[Crawler] Fetching: ${url} (Attempt ${retries + 1}/${this.maxRetries + 1})`);
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeoutMs,
        // Ensure we only accept successful HTTP responses
        validateStatus: (status) => status >= 200 && status < 300,
      });

      // Check if the content type is HTML before returning
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        return response.data;
      } else {
        console.warn(`[Crawler] Non-HTML content or unsupported type for ${url}: ${contentType}`);
        return null;
      }
    } catch (error: any) {
      if (retries < this.maxRetries) {
        console.error(`[Crawler] Failed to fetch ${url} (Attempt ${retries + 1}): ${error.message}. Retrying in ${this.retryDelayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
        return this.fetchPage(url, retries + 1); // Recursive retry
      }
      console.error(`[Crawler] Max retries reached for ${url}: ${error.message}`);
      return null;
    }
  }

  /**
   * Parses the HTML content to extract relevant data such as title, main text, and links.
   * @param url The URL of the page being parsed (used for resolving relative links).
   * @param html The HTML string content to parse.
   * @returns A CrawledData object containing the extracted information.
   */
  private parseContent(url: string, html: string): CrawledData {
    const $ = cheerio.load(html);
    const title = $('title').first().text().trim() || null; // Extract page title

    // Attempt to extract main textual content. This can be refined based on specific needs.
    // Here, we're taking all text from the body and cleaning up whitespace.
    const content = $('body').text().replace(/\s\s+/g, ' ').trim() || null;

    const links: string[] = [];
    $('a').each((_i, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          // Resolve relative URLs to absolute URLs using the base URL
          const absoluteUrl = new URL(href, url).href;
          links.push(absoluteUrl);
        } catch (e) {
          console.warn(`[Crawler] Invalid link encountered on ${url}: ${href}. Error: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    });

    return {
      url,
      title,
      content,
      links: [...new Set(links)], // Remove duplicate links found on the page
      crawledAt: new Date(),
    };
  }

  /**
   * Stores the extracted data. In a real application, this would interact with a database.
   * For this example, data is stored in a simple in-memory array.
   * @param data The CrawledData object to store.
   */
  private storeData(data: CrawledData): void {
    console.log(`[Crawler] Storing data for: ${data.url}`);
    // This is where database interaction logic would go (e.g., ORM call, direct query)
    this.crawledPages.push(data);
    // console.log(`[Crawler] Current stored pages count: ${this.crawledPages.length}`);
  }

  /**
   * The main method to initiate crawling for a given URL.
   * It orchestrates fetching, parsing, and storing.
   * @param url The target URL to crawl.
   * @returns The CrawledData object if successful, or null if the crawl fails.
   */
  public async crawlUrl(url: string): Promise<CrawledData | null> {
    console.log(`[Crawler] Starting crawl for: ${url}`);
    const html = await this.fetchPage(url);

    if (!html) {
      console.error(`[Crawler] Could not fetch HTML for ${url}. Aborting crawl.`);
      return null;
    }

    const crawledData = this.parseContent(url, html);
    this.storeData(crawledData);
    console.log(`[Crawler] Finished crawl for: ${url}`);
    return crawledData;
  }

  /**
   * Retrieves all pages currently stored in the in-memory cache.
   * @returns An array of CrawledData objects.
   */
  public getCrawledPages(): CrawledData[] {
    return this.crawledPages;
  }
}

// Export a singleton instance of the Crawler for application-wide use.
export const crawler = new Crawler();
