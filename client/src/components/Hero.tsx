import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Upload, Palette, Code } from "lucide-react";

export default function Hero() {
  const scrollToCreate = () => {
    const element = document.getElementById("create");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-bg">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" 
             style={{ animationDelay: "-3s" }} />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-card rounded-3xl p-8 md:p-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-glow">
            Build Your Own{" "}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              AI Chatbot
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload PDFs, Text, or Web URLs — Launch AI Agents in Minutes
          </p>
          <Button
            onClick={scrollToCreate}
            className="glow-button bg-gradient-to-r from-neon-cyan to-neon-purple px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            <Rocket className="mr-2" />
            Create Your Bot
          </Button>
          
          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="glass-card hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <Upload className="text-neon-cyan text-3xl mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Easy Upload</h3>
                <p className="text-muted-foreground">Support for PDFs, text files, and websites</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <Palette className="text-neon-purple text-3xl mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Full Customization</h3>
                <p className="text-muted-foreground">Customize appearance and personality</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <Code className="text-neon-cyan text-3xl mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">One-Click Deploy</h3>
                <p className="text-muted-foreground">Get embed code and shareable links</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
