import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Dock, Copy, Link, Rocket, Settings, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Chatbot } from "@shared/schema";

interface EmbedCodeProps {
  chatbot: Chatbot | null;
}

export default function EmbedCode({ chatbot }: EmbedCodeProps) {
  const [widgetType, setWidgetType] = useState("bubble");
  const [widgetPosition, setWidgetPosition] = useState("bottom-right");
  const [widgetSize, setWidgetSize] = useState("medium");
  const { toast } = useToast();

  const copyEmbedCode = () => {
    if (!chatbot) return;
    
    navigator.clipboard.writeText(chatbot.embedCode);
    toast({
      title: "Embed Code Copied",
      description: "The embed code has been copied to your clipboard.",
    });
  };

  const copyShareLink = () => {
    if (!chatbot) return;
    
    navigator.clipboard.writeText(chatbot.shareLink);
    toast({
      title: "Share Link Copied",
      description: "The shareable link has been copied to your clipboard.",
    });
  };

  if (!chatbot) {
    return (
      <section id="deploy" className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Deploy Your <span className="text-neon-purple">Chatbot</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create a chatbot first to get deployment options
            </p>
            <Card className="glass-card max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <Code className="text-6xl text-muted-foreground mb-4 mx-auto" />
                <p className="text-muted-foreground">No chatbot configured yet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="deploy" className="py-20 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Deploy Your <span className="text-neon-purple">Chatbot</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get your embed code and start using your AI assistant on any website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Embed Code Generator */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-8 flex items-center">
                <Code className="text-neon-cyan mr-3" />
                Embed Code
              </h3>

              {/* Embed Options */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-muted-foreground">
                    Widget Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={widgetType === "bubble" ? "default" : "ghost"}
                      onClick={() => setWidgetType("bubble")}
                      className={`p-4 h-auto text-center ${
                        widgetType === "bubble"
                          ? "bg-gradient-to-r from-neon-cyan to-neon-purple"
                          : "bg-secondary border-2 border-transparent hover:border-muted"
                      }`}
                    >
                      <div>
                        <MessageCircle className="text-2xl mb-2 mx-auto" />
                        <p className="text-sm font-medium">Chat Bubble</p>
                      </div>
                    </Button>
                    <Button
                      variant={widgetType === "inline" ? "default" : "ghost"}
                      onClick={() => setWidgetType("inline")}
                      className={`p-4 h-auto text-center ${
                        widgetType === "inline"
                          ? "bg-gradient-to-r from-neon-cyan to-neon-purple"
                          : "bg-secondary border-2 border-transparent hover:border-muted"
                      }`}
                    >
                      <div>
                        <Dock className="text-2xl mb-2 mx-auto" />
                        <p className="text-sm font-medium">Inline Widget</p>
                      </div>
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-muted-foreground">
                    Widget Position
                  </label>
                  <Select value={widgetPosition} onValueChange={setWidgetPosition}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-muted-foreground">
                    Widget Size
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["small", "medium", "large"].map((size) => (
                      <Button
                        key={size}
                        variant={widgetSize === size ? "default" : "ghost"}
                        onClick={() => setWidgetSize(size)}
                        className={`p-3 h-auto text-center ${
                          widgetSize === size
                            ? "bg-gradient-to-r from-neon-purple to-purple-600"
                            : "bg-secondary border-2 border-transparent hover:border-muted"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium capitalize">{size}</p>
                          <p className="text-xs text-muted-foreground">
                            {size === "small" && "320x400"}
                            {size === "medium" && "400x500"}
                            {size === "large" && "500x600"}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generated Code */}
              <Card className="bg-background mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-muted-foreground">
                      HTML Embed Code
                    </span>
                    <Button
                      onClick={copyEmbedCode}
                      className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:scale-105 transition-transform duration-200"
                    >
                      <Copy className="mr-2 w-4 h-4" />
                      Copy Code
                    </Button>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 font-mono text-sm text-muted-foreground overflow-x-auto">
                    <code>{chatbot.embedCode}</code>
                  </div>
                </CardContent>
              </Card>

              {/* Shareable Link */}
              <Card className="bg-background">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Shareable Link
                    </span>
                    <Button
                      onClick={copyShareLink}
                      className="bg-gradient-to-r from-neon-purple to-purple-600 hover:scale-105 transition-transform duration-200"
                    >
                      <Link className="mr-2 w-4 h-4" />
                      Copy Link
                    </Button>
                  </div>
                  <div className="bg-secondary rounded-xl p-4 font-mono text-sm text-neon-cyan break-all">
                    {chatbot.shareLink}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-8 flex items-center">
                <Dock className="text-neon-purple mr-3" />
                Widget Preview
              </h3>

              {/* Mock Website */}
              <div className="bg-white rounded-2xl overflow-hidden relative h-96">
                {/* Mock Header */}
                <div className="bg-gray-100 p-4 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      <div className="w-3 h-3 bg-green-400 rounded-full" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-4 py-2 text-sm text-gray-600">
                      https://yourwebsite.com
                    </div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="p-8 text-gray-800">
                  <h4 className="text-2xl font-bold mb-4">Your Website</h4>
                  <p className="text-gray-600 mb-4">
                    This is how your chatbot will appear on your website. Visitors can click the chat bubble to start a conversation.
                  </p>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>

                {/* Chat Bubble */}
                <div className={`absolute ${
                  widgetPosition === "bottom-right" ? "bottom-6 right-6" :
                  widgetPosition === "bottom-left" ? "bottom-6 left-6" :
                  widgetPosition === "top-right" ? "top-20 right-6" :
                  "top-20 left-6"
                }`}>
                  <Button className="w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full text-white text-xl shadow-2xl hover:scale-110 transition-transform duration-200 animate-pulse">
                    <MessageCircle />
                  </Button>
                </div>

                {/* Notification Badge */}
                <div className={`absolute w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center rounded-full animate-bounce ${
                  widgetPosition === "bottom-right" ? "bottom-20 right-4" :
                  widgetPosition === "bottom-left" ? "bottom-20 left-4" :
                  widgetPosition === "top-right" ? "top-24 right-4" :
                  "top-24 left-4"
                }`}>
                  1
                </div>
              </div>

              {/* Deployment Stats */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-cyan mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Total Chats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-purple mb-1">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-4 mt-8">
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:scale-105 transition-transform duration-200">
                  <Rocket className="mr-2 w-4 h-4" />
                  Go Live
                </Button>
                <Button 
                  variant="secondary"
                  className="flex-1 hover:bg-muted transition-colors duration-200"
                >
                  <Settings className="mr-2 w-4 h-4" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
