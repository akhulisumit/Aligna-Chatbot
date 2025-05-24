import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings, Eye, Bot, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Chatbot } from "@shared/schema";

interface BotCustomizationProps {
  knowledgeBase: string;
  onChatbotCreated: (chatbot: Chatbot) => void;
}

export default function BotCustomization({ knowledgeBase, onChatbotCreated }: BotCustomizationProps) {
  const [botName, setBotName] = useState("AI Assistant");
  const [botRole, setBotRole] = useState("support");
  const [selectedTheme, setSelectedTheme] = useState("cyan");
  const [personality, setPersonality] = useState({
    formality: 60,
    detail: 75,
    playfulness: 40,
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const themes = [
    { name: "cyan", colors: "from-neon-cyan to-blue-500", border: "border-neon-cyan" },
    { name: "purple", colors: "from-neon-purple to-purple-600", border: "border-neon-purple" },
    { name: "green", colors: "from-green-400 to-green-600", border: "border-green-400" },
    { name: "red", colors: "from-red-400 to-red-600", border: "border-red-400" },
    { name: "yellow", colors: "from-yellow-400 to-orange-500", border: "border-yellow-400" },
    { name: "pink", colors: "from-pink-400 to-pink-600", border: "border-pink-400" },
  ];

  const roleNames = {
    support: "Customer Support Agent",
    tutor: "Personal Tutor",
    coach: "Life Coach",
    sales: "Sales Assistant",
    technical: "Technical Support",
    creative: "Creative Assistant",
  };

  const handleSaveConfiguration = async () => {
    if (!knowledgeBase) {
      toast({
        title: "No Knowledge Base",
        description: "Please upload some content first before creating your chatbot.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await apiRequest("POST", "/api/chatbots", {
        name: botName,
        role: roleNames[botRole as keyof typeof roleNames],
        theme: selectedTheme,
        personality,
        knowledgeBase,
      });

      const chatbot = await response.json();
      onChatbotCreated(chatbot);
      
      toast({
        title: "Chatbot Created",
        description: "Your AI assistant has been successfully configured!",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was an error creating your chatbot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section id="customize" className="py-20 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Customize Your <span className="text-neon-purple">AI Assistant</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Personalize your chatbot's appearance, personality, and behavior
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Customization Form */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-8 flex items-center">
                <Settings className="text-neon-cyan mr-3" />
                Bot Configuration
              </h3>

              <div className="space-y-6">
                {/* Bot Name */}
                <div>
                  <Label className="text-sm font-semibold mb-3 text-muted-foreground">
                    Chatbot Name
                  </Label>
                  <Input
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                    placeholder="Enter chatbot name..."
                  />
                </div>

                {/* Role Selector */}
                <div>
                  <Label className="text-sm font-semibold mb-3 text-muted-foreground">
                    Bot Role
                  </Label>
                  <Select value={botRole} onValueChange={setBotRole}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Customer Support Agent</SelectItem>
                      <SelectItem value="tutor">Personal Tutor</SelectItem>
                      <SelectItem value="coach">Life Coach</SelectItem>
                      <SelectItem value="sales">Sales Assistant</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="creative">Creative Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Color Picker */}
                <div>
                  <Label className="text-sm font-semibold mb-3 text-muted-foreground">
                    Theme Color
                  </Label>
                  <div className="grid grid-cols-6 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setSelectedTheme(theme.name)}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.colors} border-2 transition-colors duration-200 ${
                          selectedTheme === theme.name
                            ? theme.border
                            : "border-transparent hover:border-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Personality Settings */}
                <div>
                  <Label className="text-sm font-semibold mb-3 text-muted-foreground">
                    Personality Traits
                  </Label>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Formal ← → Casual</span>
                        <span className="text-xs text-muted-foreground">{personality.formality}%</span>
                      </div>
                      <Slider
                        value={[personality.formality]}
                        onValueChange={([value]) => setPersonality(prev => ({ ...prev, formality: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Brief ← → Detailed</span>
                        <span className="text-xs text-muted-foreground">{personality.detail}%</span>
                      </div>
                      <Slider
                        value={[personality.detail]}
                        onValueChange={([value]) => setPersonality(prev => ({ ...prev, detail: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Serious ← → Playful</span>
                        <span className="text-xs text-muted-foreground">{personality.playfulness}%</span>
                      </div>
                      <Slider
                        value={[personality.playfulness]}
                        onValueChange={([value]) => setPersonality(prev => ({ ...prev, playfulness: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveConfiguration}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-neon-purple to-purple-600 hover:scale-105 transition-transform duration-200"
                >
                  <Save className="mr-2" />
                  {isCreating ? "Creating..." : "Save Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-8 flex items-center">
                <Eye className="text-neon-purple mr-3" />
                Live Preview
              </h3>

              {/* Bot Avatar Preview */}
              <div className="text-center mb-8">
                <div className={`w-24 h-24 bg-gradient-to-br ${themes.find(t => t.name === selectedTheme)?.colors} rounded-full mx-auto mb-4 flex items-center justify-center text-3xl animate-glow`}>
                  <Bot />
                </div>
                <h4 className="text-lg font-semibold">{botName}</h4>
                <p className="text-sm text-muted-foreground">{roleNames[botRole as keyof typeof roleNames]}</p>
              </div>

              {/* Sample Conversation */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${themes.find(t => t.name === selectedTheme)?.colors} rounded-full flex items-center justify-center text-sm`}>
                    <Bot />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-sm p-4 max-w-xs animate-float">
                    <p className="text-sm leading-relaxed">
                      Hello! I'm your {roleNames[botRole as keyof typeof roleNames]}. How can I help you today?
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 justify-end">
                  <div className={`bg-gradient-to-r ${themes.find(t => t.name === selectedTheme)?.colors} rounded-2xl rounded-tr-sm p-4 max-w-xs`}>
                    <p className="text-sm leading-relaxed">Can you help me understand your features?</p>
                  </div>
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
                    <span>👤</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${themes.find(t => t.name === selectedTheme)?.colors} rounded-full flex items-center justify-center text-sm`}>
                    <Bot />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-sm p-4 max-w-xs animate-float" style={{ animationDelay: "-2s" }}>
                    <p className="text-sm leading-relaxed">
                      Absolutely! I can help with various tasks based on the knowledge you've provided. What specific area would you like to know more about?
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Preview */}
              <div className="flex items-center space-x-3 p-4 bg-secondary rounded-2xl">
                <Input
                  className="flex-1 bg-transparent border-none text-foreground placeholder-muted-foreground"
                  placeholder="Type your message..."
                  disabled
                />
                <Button 
                  size="sm"
                  className={`bg-gradient-to-r ${themes.find(t => t.name === selectedTheme)?.colors} hover:scale-105 transition-transform duration-200`}
                >
                  <span>➤</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
