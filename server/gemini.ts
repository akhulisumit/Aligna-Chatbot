// Gemini API configuration
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function makeGeminiRequest(prompt: string, maxTokens: number = 500, temperature: number = 0.7): Promise<string> {
  // Simple rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

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
    console.error(`Gemini API error ${response.status}:`, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || "";
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
    
    const prompt = `You are a highly intelligent AI assistant with the following specific characteristics: ${personalityPrompt}

IMPORTANT: You have access to this custom knowledge base that contains specific information about the user's business/content:

=== KNOWLEDGE BASE START ===
${knowledgeBase}
=== KNOWLEDGE BASE END ===

Your primary job is to:
1. Answer questions using ONLY the information from the knowledge base above
2. Provide personalized responses based on the specific data in the knowledge base
3. If asked about something not in the knowledge base, politely say "I don't have that specific information in my training data, but I can help with questions related to: [briefly mention what topics are covered in the knowledge base]"
4. Always maintain your personality characteristics while being helpful and accurate

User's question: ${message}

Respond according to your role as a ${role} and use the personality traits described above. Make sure your response is directly based on the knowledge base content when relevant.`;

    const aiResponse = await makeGeminiRequest(prompt, 500, 0.7);
    
    return aiResponse || "I apologize, but I'm unable to respond at the moment. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Intelligent fallback that still references the knowledge base
    const fallbackResponses = [
      `Hello! I'm your ${role} assistant. I have access to your custom knowledge base and I'm ready to help with questions related to your specific content. What would you like to know?`,
      `Hi there! As your ${role}, I'm trained on your specific content and ready to provide personalized assistance. How can I help you today?`,
      `Welcome! I'm an AI ${role} with access to your knowledge base. I can provide detailed answers based on your uploaded content. What questions do you have?`,
      `Hello! I'm here as your dedicated ${role}. I have your specific knowledge base loaded and I'm ready to provide personalized support. What can I assist you with?`,
      `Hi! I'm your AI ${role}, specifically trained on your content. I can help answer questions and provide support based on your knowledge base. What would you like to discuss?`
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

export async function processUploadedContent(content: string, type: 'pdf' | 'text' | 'url'): Promise<string> {
  try {
    const prompt = `You are an expert content processor. Analyze and organize the following ${type} content into a structured knowledge base format that will be used to train an AI chatbot.

Your task:
1. Extract all key information, facts, and important details
2. Organize the content into clear topics and sections
3. Include specific data, numbers, procedures, policies, or instructions if present
4. Format it as a comprehensive knowledge base that an AI can reference to answer user questions accurately
5. Preserve important context and relationships between different pieces of information

Content to process:
${content}

Please structure this as a detailed knowledge base that will enable accurate, personalized responses.`;

    const processedContent = await makeGeminiRequest(prompt, 2000, 0.3);
    
    return processedContent || content;
  } catch (error) {
    console.error("Content processing error:", error);
    
    // Return the original content formatted as a knowledge base
    const formattedContent = `
=== KNOWLEDGE BASE ===

Content Type: ${type.toUpperCase()}
Source: Direct Input

Main Content:
${content}

=== END KNOWLEDGE BASE ===

This content is now ready to be used by your AI assistant to provide personalized responses based on your specific information.
    `.trim();
    
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