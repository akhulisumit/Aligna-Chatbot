import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Bot className="text-neon-cyan text-2xl" />
            <span className="text-xl font-bold">ChatBot Builder</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("create")}
              className="hover:text-neon-cyan transition-colors duration-200"
            >
              Create
            </button>
            <button
              onClick={() => scrollToSection("customize")}
              className="hover:text-neon-cyan transition-colors duration-200"
            >
              Customize
            </button>
            <button
              onClick={() => scrollToSection("preview")}
              className="hover:text-neon-cyan transition-colors duration-200"
            >
              Preview
            </button>
            <button
              onClick={() => scrollToSection("deploy")}
              className="hover:text-neon-cyan transition-colors duration-200"
            >
              Deploy
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <button
              onClick={() => scrollToSection("create")}
              className="block w-full text-left py-2 hover:text-neon-cyan transition-colors duration-200"
            >
              Create
            </button>
            <button
              onClick={() => scrollToSection("customize")}
              className="block w-full text-left py-2 hover:text-neon-cyan transition-colors duration-200"
            >
              Customize
            </button>
            <button
              onClick={() => scrollToSection("preview")}
              className="block w-full text-left py-2 hover:text-neon-cyan transition-colors duration-200"
            >
              Preview
            </button>
            <button
              onClick={() => scrollToSection("deploy")}
              className="block w-full text-left py-2 hover:text-neon-cyan transition-colors duration-200"
            >
              Deploy
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
