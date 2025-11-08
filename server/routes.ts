app.post("/api/chatbots", async (req, res) => {
    try {
      // Assuming insertChatbotSchema has been updated to include knowledgeBaseSource
      // (string, representing URL or text) and knowledgeBaseSourceType ('text' | 'website')
      const { knowledgeBaseSource, knowledgeBaseSourceType, ...restOfValidatedData } = insertChatbotSchema.parse(req.body);
      
      let processedKnowledgeContent: string;

      // Determine the type of knowledge base and call the processing function accordingly
      if (knowledgeBaseSourceType === 'website') {
        // If the source is a website, crawl it to get the content
        processedKnowledgeContent = await processUploadedContent(knowledgeBaseSource, 'website');
      } else {
        // Default to text if type is 'text' or unspecified
        processedKnowledgeContent = await processUploadedContent(knowledgeBaseSource, 'text');
      }
      
      const chatbot = await storage.createChatbot({
        ...restOfValidatedData,
        knowledgeBase: processedKnowledgeContent // Store the processed text content
      });
      
      res.json(chatbot);
    } catch (error) {
      console.error("Error creating chatbot:", error);
      res.status(400).json({ message: "Failed to create chatbot" });
    }
  });