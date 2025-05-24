import { users, chatbots, chatMessages, type User, type InsertUser, type Chatbot, type InsertChatbot, type ChatMessage, type InsertChatMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createChatbot(chatbot: InsertChatbot): Promise<Chatbot>;
  getChatbot(id: number): Promise<Chatbot | undefined>;
  getAllChatbots(): Promise<Chatbot[]>;
  updateChatbot(id: number, updates: Partial<Chatbot>): Promise<Chatbot | undefined>;
  deleteChatbot(id: number): Promise<boolean>;
  
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(chatbotId: number): Promise<ChatMessage[]>;
  deleteChatMessages(chatbotId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatbots: Map<number, Chatbot>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentChatbotId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.chatbots = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentChatbotId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChatbot(insertChatbot: InsertChatbot): Promise<Chatbot> {
    const id = this.currentChatbotId++;
    const embedCode = `<script src="https://chatbot-builder.com/embed.js"></script>
<script>
  ChatbotBuilder.init({
    botId: '${id}',
    position: 'bottom-right',
    size: 'medium',
    theme: 'dark',
    primaryColor: '#00D9FF'
  });
</script>`;
    const shareLink = `https://chatbot-builder.com/chat/${id}`;
    
    const chatbot: Chatbot = {
      ...insertChatbot,
      id,
      embedCode,
      shareLink,
      isActive: true,
    };
    this.chatbots.set(id, chatbot);
    return chatbot;
  }

  async getChatbot(id: number): Promise<Chatbot | undefined> {
    return this.chatbots.get(id);
  }

  async getAllChatbots(): Promise<Chatbot[]> {
    return Array.from(this.chatbots.values());
  }

  async updateChatbot(id: number, updates: Partial<Chatbot>): Promise<Chatbot | undefined> {
    const chatbot = this.chatbots.get(id);
    if (!chatbot) return undefined;
    
    const updatedChatbot = { ...chatbot, ...updates };
    this.chatbots.set(id, updatedChatbot);
    return updatedChatbot;
  }

  async deleteChatbot(id: number): Promise<boolean> {
    return this.chatbots.delete(id);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { ...insertMessage, id };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(chatbotId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.chatbotId === chatbotId
    );
  }

  async deleteChatMessages(chatbotId: number): Promise<boolean> {
    const messages = Array.from(this.chatMessages.values()).filter(
      (message) => message.chatbotId === chatbotId
    );
    
    messages.forEach((message) => {
      this.chatMessages.delete(message.id);
    });
    
    return true;
  }
}

export const storage = new MemStorage();
