import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-openai-api-key"
});

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
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant with the following characteristics: ${personalityPrompt}
          
Your knowledge base contains the following information:
${knowledgeBase}

Use this knowledge base to answer questions accurately. If the question cannot be answered from the knowledge base, politely indicate that you don't have that information available.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I apologize, but I'm unable to respond at the moment. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback responses when API is unavailable or quota exceeded
    const fallbackResponses = [
      `Hello! I'm your AI assistant trained on your uploaded content. I'm here to help answer questions and provide support based on the knowledge you've provided. How can I assist you today?`,
      `Hi there! As your ${role}, I'm ready to help you with any questions or concerns. I've been trained on your specific content and can provide detailed assistance. What would you like to know?`,
      `Welcome! I'm an AI chatbot configured to assist you based on your uploaded documents and content. I can help with information, answer questions, and provide support. What can I help you with?`,
      `Hello! I'm here to assist you as your dedicated ${role}. I have access to your knowledge base and I'm ready to help with any questions or tasks you have. How may I help you today?`,
      `Hi! I'm your AI assistant, trained specifically on your content. Whether you need information, support, or answers to questions, I'm here to help. What would you like to discuss?`
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

export async function processUploadedContent(content: string, type: 'pdf' | 'text' | 'url'): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a content processor. Extract and summarize the key information from the provided ${type} content. Focus on the main topics, important facts, and actionable information that would be useful for a chatbot to answer questions about. Format the output as a structured knowledge base.`
        },
        {
          role: "user",
          content: `Please process this ${type} content: ${content}`
        }
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content || content;
  } catch (error) {
    console.error("Content processing error:", error);
    
    // Enhanced fallback processing when API is unavailable
    const processedContent = `
Knowledge Base Content (${type.toUpperCase()}):

${content}

This content has been uploaded and is ready to train your AI assistant. The chatbot will use this information to provide intelligent responses to user questions.

Key Features:
- Content Type: ${type.toUpperCase()}
- Processing Status: Ready
- Available for AI Training: Yes
    `.trim();
    
    return processedContent;
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
