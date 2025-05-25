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
    <section className="relative min-h-screen lg:min-h-[120vh] flex items-center justify-center overflow-hidden">
      {/* Light Aesthetic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Subtle Light Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-100/10 rounded-full blur-2xl animate-float" />
        
        {/* Minimal Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEwMCwgMTE2LCAxMzksIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Hero Content */}
        <div className="text-center mb-20">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-8">
            <div className="bg-white rounded-full px-6 py-2 shadow-sm">
              <span className="text-sm font-medium text-slate-600">⚡ Enterprise AI Platform</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="block text-slate-900 mb-4">Build Intelligent</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Chatbots
            </span>
            <span className="block text-slate-700 text-4xl md:text-5xl lg:text-6xl mt-4">
              In Minutes
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Transform your business with AI-powered chatbots that understand your content, 
            <br className="hidden md:block" />
            engage your customers, and deliver exceptional experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              onClick={scrollToCreate}
              className="group relative px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-white/10"
            >
              <Rocket className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Start Building Now
            </Button>
            
            <Button
              variant="outline"
              className="px-8 py-4 border-2 border-gray-700 hover:border-gray-500 bg-transparent text-gray-300 hover:bg-gray-900/50 rounded-2xl text-lg font-semibold transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center p-6 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-500 text-sm">Uptime</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-gray-500 text-sm">Integrations</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">10M+</div>
            <div className="text-gray-500 text-sm">Messages</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-500 text-sm">Support</div>
          </div>
        </div>
        
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group p-8 bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105">
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Smart Upload</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Advanced AI processing for PDFs, documents, and web content with intelligent extraction
              </p>
            </CardContent>
          </Card>
          
          <Card className="group p-8 bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105">
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Palette className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Personality</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Customize behavior, tone, and responses to match your brand voice perfectly
              </p>
            </CardContent>
          </Card>
          
          <Card className="group p-8 bg-gray-900/30 backdrop-blur-sm border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105">
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Code className="text-2xl text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">One-Click Deploy</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Enterprise-ready deployment with embed codes, APIs, and real-time analytics
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
