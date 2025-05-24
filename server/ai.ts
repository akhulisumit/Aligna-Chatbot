// OpenRouter AI configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function makeAIRequest(prompt: string, maxTokens: number = 500, temperature: number = 0.7): Promise<string> {
  // Simple rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-small-3.1-24b-instruct:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenRouter API error ${response.status}:`, errorText);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
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
    
    const prompt = `You are a ${personalityPrompt}

KNOWLEDGE BASE:
${truncatedKB}

USER QUESTION: ${message}

INSTRUCTIONS:
1. Answer the user's question using ONLY information from the knowledge base above
2. Be specific and reference actual details from the content
3. If the question isn't covered in the knowledge base, say "I don't have that specific information, but I can help with [mention what topics are in the knowledge base]"
4. Maintain your personality traits while being accurate and helpful

Provide a direct, personalized response based on the knowledge base:`;

    const aiResponse = await makeAIRequest(prompt, 400, 0.7);
    
    return aiResponse || "I apologize, but I'm unable to respond at the moment. Please try again.";
  } catch (error) {
    console.error("OpenRouter API error:", error);
    
    // Intelligent fallback that references available content
    const kbPreview = knowledgeBase.slice(0, 500) + (knowledgeBase.length > 500 ? "..." : "");
    
    return `Hello! I'm your ${role} assistant. I have access to your knowledge base which contains information about: ${kbPreview.replace(/[=\n]/g, ' ').trim()}. How can I help you with questions related to this content?`;
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
    // If content is too large, chunk it and process in parts
    if (content.length > 50000) {
      console.log(`Large content detected (${content.length} chars), processing in chunks...`);
      
      const chunks = chunkContent(content, 20000);
      const processedChunks = [];
      
      for (let i = 0; i < Math.min(chunks.length, 5); i++) { // Limit to 5 chunks
        const chunk = chunks[i];
        const prompt = `Extract and summarize the key information from this ${type} content chunk ${i + 1}. Focus on the most important facts, data, and actionable information:

${chunk}

Provide a concise summary that captures the essential information.`;

        try {
          const processed = await makeAIRequest(prompt, 1000, 0.3);
          if (processed) {
            processedChunks.push(`=== SECTION ${i + 1} ===\n${processed}`);
          }
        } catch (chunkError) {
          console.error(`Error processing chunk ${i + 1}:`, chunkError);
          // Include raw chunk if processing fails
          processedChunks.push(`=== SECTION ${i + 1} ===\n${chunk.slice(0, 2000)}...`);
        }
      }
      
      return `=== KNOWLEDGE BASE ===\n\n${processedChunks.join('\n\n')}\n\n=== END KNOWLEDGE BASE ===`;
    }
    
    // For smaller content, process normally
    const prompt = `Extract and organize the key information from this ${type} content into a structured knowledge base:

${content}

Focus on the most important facts, data, and actionable information that will help answer user questions.`;

    const processedContent = await makeAIRequest(prompt, 1500, 0.3);
    
    return processedContent || content;
  } catch (error) {
    console.error("Content processing error:", error);
    
    // Return a trimmed version of the original content
    const trimmedContent = content.length > 10000 ? content.slice(0, 10000) + "..." : content;
    const formattedContent = `
=== KNOWLEDGE BASE ===

Content Type: ${type.toUpperCase()}
Source: Direct Input

Main Content:
${trimmedContent}

=== END KNOWLEDGE BASE ===

This content is ready for your AI assistant to provide personalized responses.
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