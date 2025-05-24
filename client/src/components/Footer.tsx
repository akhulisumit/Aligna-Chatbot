import { Heart, Github, FileText, Mail, Twitter, MessageSquare, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <span className="text-lg text-white">Made with</span>
            <Heart className="text-red-400 animate-pulse w-5 h-5" />
            <span className="text-lg text-white">at</span>
            <span className="text-lg font-bold text-white">
              Hackathon 2025
            </span>
          </div>
          
          <div className="flex justify-center space-x-8 mb-8 flex-wrap">
            <a 
              href="#" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <FileText className="w-5 h-5" />
              <span>Terms</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Mail className="w-5 h-5" />
              <span>Contact</span>
            </a>
          </div>

          <div className="flex justify-center space-x-6 text-2xl mb-8">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-neon-cyan transition-colors duration-200"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-neon-cyan transition-colors duration-200"
            >
              <MessageSquare className="w-6 h-6" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-neon-cyan transition-colors duration-200"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-neon-cyan transition-colors duration-200"
            >
              <Youtube className="w-6 h-6" />
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-muted-foreground text-sm">
            <p>&copy; 2025 ChatBot Builder. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
