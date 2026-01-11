//shared schema
import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatbots = pgTable("chatbots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  theme: text("theme").notNull(),
  personality: jsonb("personality").$type<{
    formality: number;
    detail: number;
    playfulness: number;
  }>().notNull(),
  knowledgeBase: text("knowledge_base").notNull(),
  embedCode: text("embed_code").notNull(),
  shareLink: text("share_link").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chatbotId: integer("chatbot_id").notNull(),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatbotSchema = createInsertSchema(chatbots).pick({
  name: true,
  role: true,
  theme: true,
  personality: true,
  knowledgeBase: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  chatbotId: true,
  message: true,
  isUser: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChatbot = z.infer<typeof insertChatbotSchema>;
export type Chatbot = typeof chatbots.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
