import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FileUpload from "@/components/FileUpload";
import BotCustomization from "@/components/BotCustomization";
import ChatPreview from "@/components/ChatPreview";
import EmbedCode from "@/components/EmbedCode";
import Footer from "@/components/Footer";
import { useState } from "react";
import type { Chatbot } from "@shared/schema";

export default function Home() {
  const [currentChatbot, setCurrentChatbot] = useState<Chatbot | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<string>("");

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <Hero />
      <FileUpload onContentProcessed={setKnowledgeBase} />
      <BotCustomization 
        knowledgeBase={knowledgeBase}
        onChatbotCreated={setCurrentChatbot}
      />
      <ChatPreview chatbot={currentChatbot} />
      <EmbedCode chatbot={currentChatbot} />
      <Footer />
    </div>
  );
}
