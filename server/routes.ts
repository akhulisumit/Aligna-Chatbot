import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatbotSchema, insertChatMessageSchema } from "@shared/schema";
import { generateChatbotResponse, processUploadedContent } from "./ai";
// File upload functionality (simplified for reliability)

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new chatbot
  app.post("/api/chatbots", async (req, res) => {
    try {
      const validatedData = insertChatbotSchema.parse(req.body);
      
      let contentType: 'text' | 'url' = 'text';
      if (isValidUrl(validatedData.knowledgeBase)) {
        contentType = 'url';
        console.log(`Initiating crawl for chatbot knowledge base URL: ${validatedData.knowledgeBase}`);
      } else {
        console.log(`Processing text content for chatbot knowledge base (first 50 chars): ${validatedData.knowledgeBase.substring(0, 50)}...`);
      }

      // Process the knowledge base content
      const processedKnowledge = await processUploadedContent(
        validatedData.knowledgeBase,
        contentType
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
      
      let effectiveType: 'text' | 'url' = 'text';
      if (type === 'url') {
        if (!isValidUrl(content)) {
          console.warn("Attempted to process content as URL, but content is not a valid URL.");
          return res.status(400).json({ message: "Content must be a valid URL when type is 'url'" });
        }
        effectiveType = 'url';
        console.log(`Explicitly processing content as URL: ${content}`);
      } else if (isValidUrl(content) && !type) {
        effectiveType = 'url';
        console.log(`Inferring content type as URL for processing: ${content}`);
      } else {
        console.log(`Processing content as text (first 50 chars): ${content.substring(0, 50)}...`);
      }

      const processedContent = await processUploadedContent(content, effectiveType);
      res.json({ processedContent });
    } catch (error) {
      console.error("Error processing content:", error);
      res.status(500).json({ message: "Failed to process content" });
    }
  });

  // Embed widget endpoint
  app.get("/api/chatbots/:id/widget", async (req, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).send('Chatbot not found');
      }

      const widgetHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${chatbot.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .chat-header {
            background: rgba(255,255,255,0.95);
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
        }
        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: rgba(255,255,255,0.9);
        }
        .message {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
        }
        .message.user {
            justify-content: flex-end;
        }
        .message-bubble {
            max-width: 70%;
            padding: 10px 15px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;
        }
        .message.user .message-bubble {
            background: linear-gradient(45deg, #00D9FF, #8B5CF6);
            color: white;
        }
        .message.bot .message-bubble {
            background: #f1f3f4;
            color: #333;
        }
        .chat-input {
            padding: 15px;
            background: rgba(255,255,255,0.95);
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        .chat-input input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
        }
        .chat-input button {
            padding: 10px 20px;
            background: linear-gradient(45deg, #00D9FF, #8B5CF6);
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
        }
        .typing {
            padding: 10px 15px;
            background: #f1f3f4;
            border-radius: 18px;
            font-size: 14px;
            font-style: italic;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="chat-header">
        <strong>${chatbot.name}</strong>
        <span style="margin-left: 10px; font-size: 12px; color: #666;">Ask me anything!</span>
    </div>
    <div class="chat-messages" id="messages">
        <div class="message bot">
            <div class="message-bubble">
                Hello! I'm ${chatbot.name}, your ${chatbot.role}. How can I help you today?
            </div>
        </div>
    </div>
    <div class="chat-input">
        <input type="text" id="messageInput" placeholder="Type your message..." />
        <button onclick="sendMessage()">Send</button>
    </div>

    <script>
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;

            addMessage(message, true);
            input.value = '';
            
            showTyping();
            
            fetch('/api/chatbots/${chatbotId}/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            })
            .then(res => res.json())
            .then(data => {
                hideTyping();
                addMessage(data.response, false);
            })
            .catch(err => {
                hideTyping();
                addMessage('Sorry, there was an error. Please try again.', false);
            });
        }

        function addMessage(text, isUser) {
            const messages = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + (isUser ? 'user' : 'bot');
            messageDiv.innerHTML = '<div class="message-bubble">' + text + '</div>';
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }

        function showTyping() {
            const messages = document.getElementById('messages');
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing';
            typingDiv.className = 'message bot';
            typingDiv.innerHTML = '<div class="typing">Typing...</div>';
            messages.appendChild(typingDiv);
            messages.scrollTop = messages.scrollHeight;
        }

        function hideTyping() {
            const typing = document.getElementById('typing');
            if (typing) typing.remove();
        }

        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(widgetHtml);
    } catch (error) {
      console.error("Error serving widget:", error);
      res.status(500).send('Widget error');
    }
  });

  // Chat page endpoint
  app.get("/chat/:id", async (req, res) => {
    try {
      const chatbotId = parseInt(req.params.id);
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot) {
        return res.status(404).send('Chatbot not found');
      }

      // Redirect to main app with chatbot loaded
      res.redirect(`/?chatbot=${chatbotId}`);
    } catch (error) {
      console.error("Error serving chat page:", error);
      res.status(500).send('Chat page error');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}