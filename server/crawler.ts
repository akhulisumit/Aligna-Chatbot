import axios from 'axios';
import * as cheerio from 'cheerio';

interface CrawlResult {
  url: string;
  title: string | null;
  content: string | null;
  extractedLinks: string[];
  error?: string;
}

/**
 * Fetches HTML content from a given URL.
 * @param url The URL to fetch.
 * @returns The HTML content as a string.
 * @throws Error if the network request fails.
 */
async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { timeout: 10000 }); // 10-second timeout
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch ${url}: ${error.message} (Status: ${error.response?.status})`);
    } else {
      throw new Error(`An unexpected error occurred while fetching ${url}: ${error.message}`);
    }
  }
}

/**
 * Parses HTML content to extract relevant information (title, main content, links).
 * @param html The HTML content to parse.
 * @param baseUrl The base URL of the page being crawled, used for resolving relative links.
 * @returns An object containing extracted title, content, and links.
 */
function parseHtml(html: string, baseUrl: string): Omit<CrawlResult, 'url' | 'error'> {
  const $ = cheerio.load(html);

  const title = $('head title').text().trim() || null;

  // A simplified approach to extract main content. Can be refined.
  let content: string[] = [];
  $('p, h1, h2, h3, h4, h5, h6, li').each((_i, el) => {
    const text = $(el).text().trim();
    if (text) {
      content.push(text);
    }
  });
  const mainContent = content.join('\n') || null;

  const extractedLinks: string[] = [];
  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href');
    if (href) {
      try {
        // Resolve relative URLs to absolute URLs
        const absoluteUrl = new URL(href, baseUrl).href;
        extractedLinks.push(absoluteUrl);
      } catch (e) {
        // console.warn(`Could not resolve URL: ${href} relative to ${baseUrl}`);
      }
    }
  });

  return {
    title,
    content: mainContent,
    extractedLinks: Array.from(new Set(extractedLinks)) // Remove duplicates
  };
}

/**
 * Main function to crawl a single web page.
 * Fetches, parses, and returns structured data from the URL.
 * @param url The URL of the page to crawl.
 * @returns A CrawlResult object containing the extracted data or an error message.
 */
export async function crawlWebsite(url: string): Promise<CrawlResult> {
  console.log(`Starting crawl for: ${url}`);
  try {
    const html = await fetchHtml(url);
    const parsedData = parseHtml(html, url);

    // TODO: Integrate with storage (e.g., database) and AI components here
    // For example:
    // await storageService.saveCrawlResult(url, parsedData);
    // await aiService.processContent(parsedData.content);

    console.log(`Successfully crawled: ${url}`);
    return { url, ...parsedData };
  } catch (error: any) {
    console.error(`Error crawling ${url}: ${error.message}`);
    return {
      url,
      title: null,
      content: null,
      extractedLinks: [],
      error: error.message
    };
  }
}

// Example usage (for testing/demonstration, can be removed in production):
// if (require.main === module) {
//   (async () => {
//     const testUrl = "https://example.com"; // Replace with a real URL for testing
//     const result = await crawlWebsite(testUrl);
//     console.log(JSON.stringify(result, null, 2));
//   })();
// }