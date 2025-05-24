import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Globe, Edit, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onContentProcessed: (content: string) => void;
}

export default function FileUpload({ onContentProcessed }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textContent, setTextContent] = useState("");
  const { toast } = useToast();

  const simulateUpload = async (content: string, type: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 90) {
          clearInterval(interval);
          return 90;
        }
        return next;
      });
    }, 300);

    try {
      // Process content with OpenAI
      const response = await apiRequest("POST", "/api/process-content", {
        content,
        type
      });
      
      const data = await response.json();
      setUploadProgress(100);
      
      setTimeout(() => {
        onContentProcessed(data.processedContent);
        setIsUploading(false);
        setUploadProgress(0);
        toast({
          title: "Upload Successful",
          description: "Your content has been processed and is ready to use.",
        });
      }, 1000);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: "There was an error processing your content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'pdf' ? '.pdf' : '.txt,.md,.doc,.docx';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          simulateUpload(content, type);
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  const handleUrlSubmit = () => {
    const url = prompt("Enter the website URL:");
    if (url) {
      simulateUpload(`Website URL: ${url}`, "url");
    }
  };

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      simulateUpload(textContent, "text");
      setTextContent("");
      setIsTextModalOpen(false);
    }
  };

  return (
    <section id="create" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 mb-8">
            <div className="bg-black rounded-full px-6 py-2">
              <span className="text-sm font-medium text-gray-400">📚 Knowledge Base</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
            Upload Your <span className="bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent">Content</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Train your AI assistant with any content format - documents, websites, or direct text input
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* PDF Upload */}
          <Card 
            className="group cursor-pointer bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105"
            onClick={() => handleFileUpload("pdf")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">PDF Documents</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Upload PDF files with advanced text extraction</p>
              <Button className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 rounded-xl transition-all duration-300">
                Choose PDF
              </Button>
            </CardContent>
          </Card>

          {/* Text Upload */}
          <Card 
            className="group cursor-pointer bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105"
            onClick={() => handleFileUpload("text")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Text Files</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Support for .txt, .md, .doc formats</p>
              <Button className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 rounded-xl transition-all duration-300">
                Choose Text
              </Button>
            </CardContent>
          </Card>

          {/* Website URL */}
          <Card 
            className="group cursor-pointer bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105"
            onClick={handleUrlSubmit}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Globe className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Website URL</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Extract content from web pages</p>
              <Button className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 rounded-xl transition-all duration-300">
                Add URL
              </Button>
            </CardContent>
          </Card>

          {/* Direct Text Input */}
          <Card 
            className="group cursor-pointer bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105"
            onClick={() => setIsTextModalOpen(true)}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Edit className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Direct Input</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Paste or type content directly</p>
              <Button className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 rounded-xl transition-all duration-300">
                Start Typing
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Indicator */}
        {isUploading && (
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Processing Files...</span>
                <span className="text-neon-cyan font-bold">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="mb-4" />
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="text-green-400 mr-2" />
                <span>Files uploaded successfully</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Text Input Modal */}
        <Dialog open={isTextModalOpen} onOpenChange={setIsTextModalOpen}>
          <DialogContent className="glass-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Enter Your Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-64 bg-secondary border-border text-foreground placeholder-muted-foreground"
                placeholder="Paste your content here or start typing..."
              />
              <div className="flex justify-end space-x-4">
                <Button 
                  variant="secondary"
                  onClick={() => setIsTextModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleTextSubmit}
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:scale-105 transition-transform duration-200"
                >
                  Add Content
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
