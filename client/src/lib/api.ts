import { apiRequest } from "./queryClient";
import type { Chatbot, InsertChatbot } from "@shared/schema";

export const api = {
  // Chatbot operations
  createChatbot: async (data: InsertChatbot): Promise<Chatbot> => {
    const response = await apiRequest("POST", "/api/chatbots", data);
    return response.json();
  },

  getChatbots: async (): Promise<Chatbot[]> => {
    const response = await apiRequest("GET", "/api/chatbots");
    return response.json();
  },

  getChatbot: async (id: number): Promise<Chatbot> => {
    const response = await apiRequest("GET", `/api/chatbots/${id}`);
    return response.json();
  },

  updateChatbot: async (id: number, updates: Partial<Chatbot>): Promise<Chatbot> => {
    const response = await apiRequest("PATCH", `/api/chatbots/${id}`, updates);
    return response.json();
  },

  deleteChatbot: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/chatbots/${id}`);
  },

  // Message operations
  sendMessage: async (chatbotId: number, message: string): Promise<{ response: string; messageId: number }> => {
    const response = await apiRequest("POST", `/api/chatbots/${chatbotId}/messages`, { message });
    return response.json();
  },

  getChatMessages: async (chatbotId: number) => {
    const response = await apiRequest("GET", `/api/chatbots/${chatbotId}/messages`);
    return response.json();
  },

  // Content processing
  processContent: async (content: string, type: string): Promise<{ processedContent: string }> => {
    const response = await apiRequest("POST", "/api/process-content", { content, type });
    return response.json();
  },
};
