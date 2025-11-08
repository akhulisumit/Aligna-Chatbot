async function scrapeWebContent(url: string): Promise<string> {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Validate URL format with explicit error handling
    try {
      new URL(cleanUrl);
    } catch (e) {
      throw new Error(`Invalid URL format: ${cleanUrl}. Please provide a valid web address.`);
    }
    
    const response = await axios.get(cleanUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Only resolve for 2xx status codes
      }
    });

    // Ensure content type is HTML before parsing
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error(`URL content is not HTML (Content-Type: ${contentType || 'unknown'}). Cannot scrape non-HTML content.`);
    }
    
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements more aggressively to reduce noise
    $('script, style, nav, footer, header, .menu, .sidebar, .advertisement, .ad, .popup, form, iframe, noscript, svg, button, input, select, textarea').remove();
    
    const contentParts: string[] = [];

    // 1. Add page title
    const title = $('title').text().trim();
    if (title) contentParts.push(`TITLE: ${title}`);

    // 2. Try to get main article/body content from specific semantic tags or common content divs
    // This prioritizes larger, more structured blocks of content.
    const mainContentSelectors = [
      'article',
      'main',
      '.main-content',
      '.content-body',
      '.post-content',
      '#content',
      '#main',
      '.article-content',
      '.entry-content',
      '.post',
    ];

    let mainContentBlockText = '';
    for (const selector of mainContentSelectors) {
      const selectedText = $(selector).text().trim();
      // Take the largest block found, assuming it's the most relevant main content
      if (selectedText.length > mainContentBlockText.length) {
        mainContentBlockText = selectedText;
      }
    }
    // Only add if the main block is substantial to avoid adding trivial content
    if (mainContentBlockText.length > 150) {
      contentParts.push(mainContentBlockText);
    }

    // 3. Fallback/Augmentation: Extract all visible text from common text elements
    // This captures content not necessarily within a specific 'main' block but still relevant,
    // and ensures coverage if mainContentBlockText was not substantial.
    const generalTextSelectors = 'h1, h2, h3, h4, h5, h6, p, li, span.text, div.text-content, div[class*="body"], div[class*="content"]';
    $(generalTextSelectors).each((_, el) => {
      const text = $(el).text().trim();
      // Heuristically filter short or potentially irrelevant text, but always include non-empty headings
      if (text.length > 30 || (el.tagName.match(/^h[1-6]$/i) && text.length > 0)) {
        contentParts.push(text);
      }
    });

    // 4. Join parts and clean up
    let content = contentParts.join('\n\n').trim();
    
    // Consolidate multiple newlines and spaces for cleaner output
    content = content.replace(/(\n\s*){2,}/g, '\n\n').replace(/\s{2,}/g, ' ').trim();
    
    // Final check for meaningful content length
    if (content.length < 200) { // Increased minimum length for 'meaningful' content
      // If still too short, attempt a last-resort fallback to a heavily trimmed body text
      const bodyTextFallback = $('body').text().trim().replace(/(\n\s*){2,}/g, '\n\n').replace(/\s{2,}/g, ' ').trim();
      if (bodyTextFallback.length > 500 && bodyTextFallback.length > content.length) { 
        console.warn(`Web scraping: Insufficient specific content from ${cleanUrl}, falling back to trimmed body text.`);
        content = bodyTextFallback;
      } else {
        throw new Error('Insufficient meaningful content extracted from website after all attempts. Page might be empty, heavily JS-driven, or an API endpoint.');
      }
    }
    
    return content.slice(0, 50000); // Limit content size to prevent excessive input to AI
  } catch (error) {
    console.error(`Web scraping error for ${url}:`, error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}