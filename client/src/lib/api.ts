  // Content processing
  processContent: async (content: string, type: string): Promise<{ processedContent: string }> => {
    const response = await apiRequest("POST", "/api/process-content", { content, type });
    return response.json();
  },

  // Crawl operations
  crawlWebsite: async (url: string): Promise<{ message: string }> => {
    const response = await apiRequest("POST", "/api/crawl-website", { url });
    return response.json();
  },
};