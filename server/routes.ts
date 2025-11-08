  // Process uploaded content
  app.post("/api/process-content", async (req, res) => {
    try {
      const { content, type } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const processedContent = await processUploadedContent(content, type || 'text');
      res.json({ processedContent });
    } catch (error) {
      console.error("Error processing content:", error);
      res.status(500).json({ message: "Failed to process content" });
    }
  });

  // Manually trigger web crawl (for monitoring/debugging)
  app.post("/api/crawl/trigger", async (req, res) => {
    try {
      console.log("Crawl trigger requested.");
      // This assumes 'triggerCrawl' is a function that kicks off the crawling process
      // and is ideally non-blocking for long-running tasks.
      await triggerCrawl(); 
      res.status(200).json({ message: "Crawl triggered successfully." });
    } catch (error) {
      console.error("Error triggering crawl:", error);
      res.status(500).json({ message: "Failed to trigger crawl.", error: error.message });
    }
  });

  // Embed widget endpoint
  app.get("/api/chatbots/:id/widget", async (req, res) => {