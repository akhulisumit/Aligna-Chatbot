import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Bot, RotateCcw, Download, Share, Phone, Video, MoreVertical, Paperclip, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Chatbot } from "@shared/schema";

interface ChatPreviewProps {
  chatbot: Chatbot | null;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export default function ChatPreview({ chatbot }: ChatPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome! I'm your AI assistant trained on your documents. I can help answer questions, provide information, and guide you through various topics. What would you like to know?",
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatbot || isSending) return;

    setIsSending(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await apiRequest("POST", `/api/chatbots/${chatbot.id}/messages`, {
        message: inputMessage
      });

      const data = await response.json();
      
      setTimeout(() => {
        setIsTyping(false);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Message Failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        text: "Welcome! I'm your AI assistant trained on your documents. I can help answer questions, provide information, and guide you through various topics. What would you like to know?",
        isUser: false,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInputMessage("");
    setIsTyping(false);
  };

  const exportChat = () => {
    const chatText = messages
      .map(msg => `${msg.isUser ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n\n");
    
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-export.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sharePreview = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Preview link has been copied to clipboard.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!chatbot) {
    return (
      <section id="preview" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Test Your <span className="text-neon-cyan">Chatbot</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create a chatbot first to see the preview
            </p>
            <Card className="glass-card max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <Bot className="text-6xl text-muted-foreground mb-4 mx-auto" />
                <p className="text-muted-foreground">No chatbot configured yet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="preview" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Test Your <span className="text-neon-cyan">Chatbot</span>
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Try out your AI assistant before deploying it to your website
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="glass-card overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-neon-cyan to-neon-purple p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{chatbot.name}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm opacity-90">Online</span>
                  </div>
                </div>
                <div className="ml-auto flex space-x-3">
                  <Button size="sm" variant="ghost" className="w-10 h-10 bg-white/20 hover:bg-white/30">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-10 h-10 bg-white/20 hover:bg-white/30">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-10 h-10 bg-white/20 hover:bg-white/30">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="h-96 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.isUser ? "justify-end" : ""
                    }`}
                  >
                    {!message.isUser && (
                      <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-4 max-w-md ${
                        message.isUser
                          ? "bg-gradient-to-r from-neon-cyan to-neon-purple rounded-tr-sm"
                          : "bg-secondary rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <span className={`text-xs mt-2 block ${
                        message.isUser ? "text-white/70" : "text-muted-foreground"
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {message.isUser && (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <span>👤</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-tl-sm p-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-6 bg-secondary border-t border-border">
              <div className="flex items-center space-x-4">
                <Button size="sm" variant="ghost" className="w-10 h-10 bg-border hover:bg-muted">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-border border-muted rounded-2xl pl-4 pr-12 py-3 text-foreground placeholder-muted-foreground focus:border-neon-cyan"
                    placeholder="Type your message..."
                    disabled={isSending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isSending}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-neon-cyan to-neon-purple hover:scale-105 transition-transform duration-200"
                  >
                    <span className="text-sm">➤</span>
                  </Button>
                </div>
                <Button size="sm" variant="ghost" className="w-10 h-10 bg-border hover:bg-muted">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This is a live preview. Your actual bot will have full functionality.
              </p>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              onClick={resetChat}
              variant="ghost"
              className="glass-card hover:scale-105 transition-transform duration-200"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              Reset Chat
            </Button>
            <Button
              onClick={exportChat}
              variant="ghost"
              className="glass-card hover:scale-105 transition-transform duration-200"
            >
              <Download className="mr-2 w-4 h-4" />
              Export Chat
            </Button>
            <Button
              onClick={sharePreview}
              variant="ghost"
              className="glass-card hover:scale-105 transition-transform duration-200"
            >
              <Share className="mr-2 w-4 h-4" />
              Share Preview
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
