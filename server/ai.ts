// Gemini AI configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Use environment variable
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Web scraping imports
import axios from 'axios';
import * as cheerio from 'cheerio';

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function makeAIRequest(prompt: string, maxTokens: number = 500, temperature: number = 0.7): Promise<string> {
  // Add API Key validation
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    throw new Error("Gemini API key is missing. Please configure it in your environment variables.");
  }

  // Simple rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API request failed with status ${response.status}:`, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`); // Truncate errorText for brevity
    }

    const data = await response.json();
    // Basic validation of expected response structure
    if (!data || !data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.error("Gemini API returned an unexpected response structure:", JSON.stringify(data, null, 2));
      throw new Error("Gemini API: Unexpected response format.");
    }
    return data.candidates[0]?.content?.parts[0]?.text || "";
  } catch (error) {
    console.error("Error during Gemini API request:", error);
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error("Network error or failed to connect to Gemini API. Please check your internet connection.");
    }
    throw new Error(`Failed to get response from Gemini API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function truncateKnowledgeBase(knowledgeBase: string, maxLength: number = 30000): string {
  if (knowledgeBase.length <= maxLength) {
    return knowledgeBase;
  }
  
  // Try to keep complete sections
  const truncated = knowledgeBase.slice(0, maxLength);
  const lastSectionEnd = truncated.lastIndexOf('===');
  
  if (lastSectionEnd > maxLength * 0.5) {
    return truncated.slice(0, lastSectionEnd) + "\n\n=== (Content truncated for processing) ===";
  }
  
  return truncated + "\n\n(Content truncated for processing)";
}

export async function generateChatbotResponse(
  message: string,
  knowledgeBase: string,
  personality: {
    formality: number;
    detail: number;
    playfulness: number;
  },
  role: string
): Promise<string> {
  try {
    const personalityPrompt = createPersonalityPrompt(personality, role);
    
    // Truncate knowledge base to fit within token limits
    const truncatedKB = truncateKnowledgeBase(knowledgeBase, 30000);
    
    const prompt = `You are a ${role} with this personality: ${personalityPrompt}\n\nKnowledge: ${truncatedKB}\n\nUser: "${message}"\n\nGive a SHORT, friendly answer (1-2 sentences max) using your knowledge. Be conversational and helpful, no formatting:`;

    const aiResponse = await makeAIRequest(prompt, 150, 0.7);
    
    return aiResponse || "I apologize, but I'm unable to respond at the moment. Please try again.";
  } catch (error) {
    console.error("Error in generateChatbotResponse:", error); // More specific error message
    
    // Intelligent fallback that references available content
    const kbPreview = knowledgeBase.slice(0, 500) + (knowledgeBase.length > 500 ? "..." : "");
    
    return `Hello! I'm your ${role} assistant. I have access to your knowledge base which contains information about: ${kbPreview.replace(/[=\n]/g, ' ').trim()}. How can I help you with questions related to this content?`;
  }
}

async function scrapeWebContent(url: string): Promise<string> {
  console.log(`Attempting to scrape URL: ${url}`); // Log URL for context
  try {
    // Clean and validate URL
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Validate URL format
    try {
      new URL(cleanUrl);
    } catch (urlError) {
      console.error(`Invalid URL format provided: ${url}`, urlError);
      throw new Error(`Invalid URL format: ${urlError instanceof Error ? urlError.message : 'Unknown URL error'}`);
    }
    
    const response = await axios.get(cleanUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, .menu, .sidebar, .advertisement, .ad, .popup').remove();
    
    // Extract content with better structure
    const title = $('title').text().trim() || '';
    const headings = $('h1, h2, h3, h4').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 0).join(' ');
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 10).join(' ');
    const listItems = $('li').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 0).join(' ');
    const articleContent = $('article').text().trim() || '';
    const mainContent = $('main').text().trim() || '';
    
    let content = `${title} ${headings} ${paragraphs} ${listItems} ${articleContent} ${mainContent}`.trim();
    
    // Clean up extra whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    if (content.length < 50) {
      console.warn(`Insufficient content (${content.length} chars) extracted from URL: ${cleanUrl}`);
      throw new Error('Insufficient content extracted from website');
    }
    
    console.log(`Successfully scraped ${content.length} characters from ${cleanUrl}`); // Log success
    return content.slice(0, 50000); // Limit content size
  } catch (error) {
    console.error(`Web scraping error for URL ${url}:`, error); // Log full error object
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`Axios response error: Status ${error.response.status}, Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
        throw new Error(`Failed to scrape website (HTTP ${error.response.status}): ${error.message}`);
      } else if (error.request) {
        console.error(`Axios request error: No response received.`, error.request);
        throw new Error(`Failed to scrape website: No response received from ${url}. Check connectivity or URL.`);
      } else {
        console.error(`Axios setup error:`, error.message);
        throw new Error(`Failed to scrape website (Axios setup): ${error.message}`);
      }
    }
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function chunkContent(content: string, maxChunkSize: number = 20000): string[] {
  const chunks = [];
  for (let i = 0; i < content.length; i += maxChunkSize) {
    chunks.push(content.slice(i, i + maxChunkSize));
  }
  return chunks;
}

export async function processUploadedContent(content: string, type: 'pdf' | 'text' | 'url'): Promise<string> {
  try {
    let actualContent = content;
    
    // Handle URL scraping
    if (type === 'url') {
      try {
        console.log(`Processing URL for content extraction: ${content}`); // More specific log
        actualContent = await scrapeWebContent(content);
        console.log(`Successfully extracted ${actualContent.length} characters from URL: ${content}`); // More specific log
      } catch (error) {
        console.error(`Failed to scrape URL "${content}" during content processing:`, error); // Log full error object
        return `Failed to scrape website content from: ${content}. Please check if the URL is accessible and try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`; // Provide more error detail to user
      }
    }
    
    // If content is too large, chunk it and process in parts
    if (actualContent.length > 50000) {
      console.log(`Large content detected (${actualContent.length} chars) for type ${type}, processing in chunks...`);
      
      const chunks = chunkContent(actualContent, 20000);
      const processedChunks = [];
      
      for (let i = 0; i < Math.min(chunks.length, 5); i++) { // Limit to 5 chunks
        const chunk = chunks[i];
        const prompt = `Extract the key information from this content and organize it in a simple, easy-to-read format. Focus on facts, important details, and anything that would help answer user questions:\n\n${chunk}\n\nWrite it clearly without using markdown headers or special formatting.`;

        try {
          console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`); // Log chunk processing
          const processed = await makeAIRequest(prompt, 1000, 0.3);
          if (processed) {
            processedChunks.push(`=== SECTION ${i + 1} ===\n${processed}`);
          }
        } catch (chunkError) {
          console.error(`Error processing chunk ${i + 1} for content type ${type}:`, chunkError); // Log full chunkError object
          // Include raw chunk if processing fails
          processedChunks.push(`=== SECTION ${i + 1} (Processing Failed) ===\n${chunk.slice(0, 2000)}...\n(Failed to process this section with AI)`); // More informative fallback
        }
      }
      
      return `=== KNOWLEDGE BASE ===\n\n${processedChunks.join('\n\n')}\n\n=== END KNOWLEDGE BASE ===`;
    }
    
    // For smaller content, process normally
    console.log(`Processing smaller content (${actualContent.length} chars) for type ${type} with single AI request.`); // Log processing type
    const prompt = `Take this content and organize the key information in a simple, clear format that a chatbot can use to answer questions. Don't use markdown formatting, just write it naturally:\n\n${actualContent}\n\nFocus on the important facts and details that would be useful for answering user questions.`;

    const processedContent = await makeAIRequest(prompt, 1500, 0.3);
    
    // If AI processing returns empty, use a structured fallback of the original content
    if (!processedContent) {
      console.warn(`AI processing returned empty for content type ${type}. Falling back to structured original content.`);
      const trimmedContent = actualContent.length > 10000 ? actualContent.slice(0, 10000) + "..." : actualContent;
      return `=== KNOWLEDGE BASE ===\n\nContent Type: ${type.toUpperCase()}\nSource: Direct Input\n\nMain Content:\n${trimmedContent}\n\n=== END KNOWLEDGE BASE ===\n\n(AI processing failed or returned empty, using original content structure.)`;
    }

    return processedContent;
  } catch (error) {
    console.error("Critical content processing error:", error); // More prominent error message
    
    // Return a trimmed version of the original content
    const trimmedContent = content.length > 10000 ? content.slice(0, 10000) + "..." : content;
    const formattedContent = `\n=== KNOWLEDGE BASE ===\n\nContent Type: ${type.toUpperCase()}\nSource: Direct Input\n\nMain Content:\n${trimmedContent}\n\n=== END KNOWLEDGE BASE ===\n\nThis content is ready for your AI assistant to provide personalized responses. (Note: AI processing encountered an error and could not refine this content.)\n    `.trim();
    
    return formattedContent;
  }
}

function createPersonalityPrompt(personality: { formality: number; detail: number; playfulness: number }, role: string): string {
  let prompt = `You are a ${role}. `;
  
  // Formality (0-100 scale)
  if (personality.formality < 30) {
    prompt += "Use a casual, friendly tone with informal language. ";
  } else if (personality.formality > 70) {
    prompt += "Use a formal, professional tone with proper business language. ";
  } else {
    prompt += "Use a balanced tone that's professional yet approachable. ";
  }
  
  // Detail level (0-100 scale)
  if (personality.detail < 30) {
    prompt += "Provide brief, concise answers. ";
  } else if (personality.detail > 70) {
    prompt += "Provide detailed, comprehensive explanations with examples. ";
  } else {
    prompt += "Provide moderately detailed answers with key information. ";
  }
  
  // Playfulness (0-100 scale)
  if (personality.playfulness < 30) {
    prompt += "Maintain a serious, straightforward approach. ";
  } else if (personality.playfulness > 70) {
    prompt += "Use humor, emojis, and a lighthearted approach when appropriate. ";
  } else {
    prompt += "Use occasional light humor while staying professional. ";
  }
  
  return prompt;
}
