import { users, chatbots, chatMessages, type User, type InsertUser, type Chatbot, type InsertChatbot, type ChatMessage, type InsertChatMessage, type WebsiteSource, type InsertWebsiteSource } from "@shared/schema";

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

  // WebsiteSource storage methods
  createWebsiteSource(source: InsertWebsiteSource): Promise<WebsiteSource>;
  getWebsiteSource(id: number): Promise<WebsiteSource | undefined>;
  getWebsiteSourcesByChatbotId(chatbotId: number): Promise<WebsiteSource[]>;
  updateWebsiteSource(id: number, updates: Partial<WebsiteSource>): Promise<WebsiteSource | undefined>;
  deleteWebsiteSource(id: number): Promise<boolean>;
  deleteWebsiteSourcesByChatbotId(chatbotId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatbots: Map<number, Chatbot>;
  private chatMessages: Map<number, ChatMessage>;
  private websiteSources: Map<number, WebsiteSource>; // Added for crawling data
  private currentUserId: number;
  private currentChatbotId: number;
  private currentMessageId: number;
  private currentWebsiteSourceId: number; // Added for crawling data

  constructor() {
    this.users = new Map();
    this.chatbots = new Map();
    this.chatMessages = new Map();
    this.websiteSources = new Map(); // Initialize the new map
    this.currentUserId = 1;
    this.currentChatbotId = 1;
    this.currentMessageId = 1;
    this.currentWebsiteSourceId = 1; // Initialize new ID counter
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
    const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'https://aligna-chatbot.onrender.com';
    const embedCode = `(function(){var chatbotId='${id}',baseUrl='${baseUrl}',chatWidget=document.createElement('div');chatWidget.id='chatbot-widget-'+chatbotId;chatWidget.style.cssText='position:fixed;bottom:20px;right:20px;z-index:9999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';var chatButton=document.createElement('button');chatButton.innerHTML='💬';chatButton.style.cssText='width:60px;height:60px;border-radius:50%;background:linear-gradient(45deg,#00D9FF,#8B5CF6);border:none;color:white;font-size:24px;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:all 0.3s ease;';chatButton.onmouseover=function(){this.style.transform='scale(1.1)'};chatButton.onmouseout=function(){this.style.transform='scale(1)'};var isOpen=false,chatFrame=document.createElement('iframe');chatFrame.src=baseUrl+'/api/chatbots/'+chatbotId+'/widget';chatFrame.style.cssText='width:400px;height:500px;border:none;border-radius:15px;box-shadow:0 10px 40px rgba(0,0,0,0.3);display:none;margin-bottom:10px;background:white;';chatButton.onclick=function(){isOpen=!isOpen;chatFrame.style.display=isOpen?'block':'none'};chatWidget.appendChild(chatFrame);chatWidget.appendChild(chatButton);document.body.appendChild(chatWidget);})();`;
    const shareLink = `${baseUrl}/chat/${id}`;
    
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

  // WebsiteSource storage methods
  async createWebsiteSource(insertSource: InsertWebsiteSource): Promise<WebsiteSource> {
    const id = this.currentWebsiteSourceId++;
    const source: WebsiteSource = { 
      ...insertSource,
      id,
      crawledAt: insertSource.crawledAt || new Date(),
      status: insertSource.status || 'pending'
    };
    this.websiteSources.set(id, source);
    return source;
  }

  async getWebsiteSource(id: number): Promise<WebsiteSource | undefined> {
    return this.websiteSources.get(id);
  }

  async getWebsiteSourcesByChatbotId(chatbotId: number): Promise<WebsiteSource[]> {
    return Array.from(this.websiteSources.values()).filter(
      (source) => source.chatbotId === chatbotId
    );
  }

  async updateWebsiteSource(id: number, updates: Partial<WebsiteSource>): Promise<WebsiteSource | undefined> {
    const source = this.websiteSources.get(id);
    if (!source) return undefined;
    
    const updatedSource = { ...source, ...updates };
    this.websiteSources.set(id, updatedSource);
    return updatedSource;
  }

  async deleteWebsiteSource(id: number): Promise<boolean> {
    return this.websiteSources.delete(id);
  }

  async deleteWebsiteSourcesByChatbotId(chatbotId: number): Promise<boolean> {
    const sourcesToDelete = Array.from(this.websiteSources.values()).filter(
      (source) => source.chatbotId === chatbotId
    );
    
    sourcesToDelete.forEach((source) => {
      this.websiteSources.delete(source.id);
    });
    
    return true;
  }
}

export const storage = new MemStorage();