import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";

// ============================
// CONFIG
// ============================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GOOGLE_API_KEY is missing in environment variables");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// ============================
// RATE LIMITING
// ============================
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

// ============================
// GEMINI REQUEST (SDK-CORRECT)
// ============================
async function makeAIRequest(prompt: string): Promise<string> {
  const now = Date.now();
  const delta = now - lastRequestTime;

  if (delta < MIN_REQUEST_INTERVAL) {
    await new Promise((r) =>
      setTimeout(r, MIN_REQUEST_INTERVAL - delta)
    );
  }

  lastRequestTime = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text ?? "";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

// ============================
// UTILITIES
// ============================
function truncateKnowledgeBase(kb: string, max = 30000): string {
  if (kb.length <= max) return kb;

  const cut = kb.slice(0, max);
  const lastBreak = cut.lastIndexOf("===");

  return lastBreak > max * 0.5
    ? cut.slice(0, lastBreak) + "\n\n=== CONTENT TRUNCATED ==="
    : cut + "\n\n(CONTENT TRUNCATED)";
}

function chunkContent(content: string, size = 20000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += size) {
    chunks.push(content.slice(i, i + size));
  }
  return chunks;
}

// ============================
// PERSONALITY PROMPT
// ============================
function createPersonalityPrompt(
  personality: { formality: number; detail: number; playfulness: number },
  role: string
): string {
  let p = `You are a ${role}. `;

  p += personality.formality < 30
    ? "Use a casual tone. "
    : personality.formality > 70
    ? "Use a formal professional tone. "
    : "Use a balanced professional tone. ";

  p += personality.detail < 30
    ? "Keep answers short. "
    : personality.detail > 70
    ? "Give detailed explanations. "
    : "Give moderately detailed answers. ";

  p += personality.playfulness > 70
    ? "You may use light humor. "
    : "Stay straightforward. ";

  return p;
}

// ============================
// CHATBOT RESPONSE
// ============================
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
  const personalityPrompt = createPersonalityPrompt(personality, role);
  const kb = truncateKnowledgeBase(knowledgeBase);

  const prompt = `
${personalityPrompt}

Knowledge Base:
${kb}

User Question:
"${message}"

Reply in 1–2 short sentences. No formatting.
`;

  try {
    const reply = await makeAIRequest(prompt);
    return reply || "I’m unable to answer that right now.";
  } catch {
    return "I ran into an error answering that. Please try again.";
  }
}

// ============================
// WEB SCRAPING
// ============================
async function scrapeWebContent(url: string): Promise<string> {
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith("http")) {
    cleanUrl = "https://" + cleanUrl;
  }

  const res = await axios.get(cleanUrl, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
    },
  });

  const $ = cheerio.load(res.data);
  $("script, style, nav, footer, header, aside").remove();

  const text = [
    $("title").text(),
    $("h1,h2,h3").text(),
    $("p").text(),
    $("li").text(),
    $("article").text(),
    $("main").text(),
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 50) {
    throw new Error("Not enough content extracted");
  }

  return text.slice(0, 50000);
}

// ============================
// CONTENT PROCESSING
// ============================
export async function processUploadedContent(
  content: string,
  type: "pdf" | "text" | "url"
): Promise<string> {
  let actual = content;

  if (type === "url") {
    actual = await scrapeWebContent(content);
  }

  if (actual.length > 50000) {
    const chunks = chunkContent(actual);
    const summaries: string[] = [];

    for (let i = 0; i < Math.min(chunks.length, 5); i++) {
      const prompt = `
Extract key facts and useful information from this content.
Write plainly. No formatting.

${chunks[i]}
`;

      try {
        const summary = await makeAIRequest(prompt);
        summaries.push(`=== SECTION ${i + 1} ===\n${summary}`);
      } catch {
        summaries.push(
          `=== SECTION ${i + 1} ===\n${chunks[i].slice(0, 2000)}...`
        );
      }
    }

    return `=== KNOWLEDGE BASE ===\n\n${summaries.join(
      "\n\n"
    )}\n\n=== END KNOWLEDGE BASE ===`;
  }

  const prompt = `
Organize this content so a chatbot can answer questions from it.
No markdown. Plain text only.

${actual}
`;

  const processed = await makeAIRequest(prompt);
  return processed || actual;
}
