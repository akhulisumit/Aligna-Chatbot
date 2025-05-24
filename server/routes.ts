import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatbotSchema, insertChatMessageSchema } from "@shared/schema";
import { generateChatbotResponse, processUploadedContent } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new chatbot
  app.post("/api/chatbots", async (req, res) => {
    try {
      const validatedData = insertChatbotSchema.parse(req.body);
      
      // Process the knowledge base content
      const processedKnowledge = await processUploadedContent(
        validatedData.knowledgeBase,
        'text' // Default to text for now, can be extended
      );
      
      const chatbot = await storage.createChatbot({
        ...validatedData,
        knowledgeBase: processedKnowledge
      });
      
      res.json(chatbot);
    } catch (error) {
      console.error("Error creating chatbot:", error);
      res.status(400).json({ message: "Failed to create chatbot" });
    }
  });

  // Get all chatbots
  app.get("/api/chatbots", async (req, res) => {
    try {
      const chatbots = await storage.getAllChatbots();
      res.json(chatbots);
    } catch (error) {
      console.error("Error fetching chatbots:", error);
      res.status(500).json({ message: "Failed to fetch chatbots" });
    }
  });

  // Get a specific chatbot
  app.get("/api/chatbots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chatbot = await storage.getChatbot(id);
      
      if (!chatbot) {
        return res.status(404).json({ message: "Chatbot not found" });
      }
      
      res.json(chatbot);
    } catch (error) {
      console.error("Error fetching chatbot:", error);
      res.status(500).json({ message: "Failed to fetch chatbot" });
    }
  });

  // Update a chatbot
  app.patch("/api/chatbots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const chatbot = await storage.updateChatbot(id, updates);
      
      if (!chatbot) {
        return res.status(404).json({ message: "Chatbot not found" });
      }
      
      res.json(chatbot);
    } catch (error) {
      console.error("Error updating chatbot:", error);
      res.status(500).json({ message: "Failed to update chatbot" });
    }
  });

  // Delete a chatbot
  app.delete("/api/chatbots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteChatbot(id);
      
      if (!success) {
        return res.status(404).json({ message: "Chatbot not found" });
      }
      
      res.json({ message: "Chatbot deleted successfully" });
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      res.status(500).json({ message: "Failed to delete chatbot" });
    }
  });

  // Send a message to a chatbot
  app.post("/api/chatbots/:id/messages", async (req, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const chatbot = await storage.getChatbot(chatbotId);
      if (!chatbot) {
        return res.status(404).json({ message: "Chatbot not found" });
      }
      
      // Save user message
      await storage.createChatMessage({
        chatbotId,
        message,
        isUser: true,
        timestamp: new Date().toISOString()
      });
      
      // Generate AI response
      const aiResponse = await generateChatbotResponse(
        message,
        chatbot.knowledgeBase,
        chatbot.personality,
        chatbot.role
      );
      
      // Save AI response
      const aiMessage = await storage.createChatMessage({
        chatbotId,
        message: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      });
      
      res.json({ response: aiResponse, messageId: aiMessage.id });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Get chat messages for a chatbot
  app.get("/api/chatbots/:id/messages", async (req, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(chatbotId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}
