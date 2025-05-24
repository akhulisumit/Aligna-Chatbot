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
    <section id="create" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Upload Your <span className="text-neon-cyan">Knowledge Base</span>
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Train your AI chatbot with documents, websites, or custom text content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* PDF Upload */}
          <Card 
            className="upload-zone glass-card cursor-pointer"
            onClick={() => handleFileUpload("pdf")}
          >
            <CardContent className="p-8 text-center">
              <FileText className="text-red-400 text-4xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">PDF Documents</h3>
              <p className="text-muted-foreground text-sm mb-4">Upload PDF files up to 10MB</p>
              <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                Choose PDF
              </Button>
            </CardContent>
          </Card>

          {/* Text Upload */}
          <Card 
            className="upload-zone glass-card cursor-pointer"
            onClick={() => handleFileUpload("text")}
          >
            <CardContent className="p-8 text-center">
              <FileText className="text-green-400 text-4xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Text Files</h3>
              <p className="text-muted-foreground text-sm mb-4">Upload .txt, .md, .doc files</p>
              <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                Choose Text
              </Button>
            </CardContent>
          </Card>

          {/* Website URL */}
          <Card 
            className="upload-zone glass-card cursor-pointer"
            onClick={handleUrlSubmit}
          >
            <CardContent className="p-8 text-center">
              <Globe className="text-blue-400 text-4xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Website URL</h3>
              <p className="text-muted-foreground text-sm mb-4">Extract content from websites</p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                Add URL
              </Button>
            </CardContent>
          </Card>

          {/* Direct Text Input */}
          <Card 
            className="upload-zone glass-card cursor-pointer"
            onClick={() => setIsTextModalOpen(true)}
          >
            <CardContent className="p-8 text-center">
              <Edit className="text-neon-purple text-4xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Direct Input</h3>
              <p className="text-muted-foreground text-sm mb-4">Paste or type content directly</p>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
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
