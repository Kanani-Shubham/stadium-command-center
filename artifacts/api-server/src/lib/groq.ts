import Groq from "groq-sdk";
import { logger } from "./logger";

const apiKey = process.env["GROQ_API_KEY"];

if (!apiKey) {
  logger.warn("GROQ_API_KEY is not set — AI endpoints will return an error until it is configured");
}

export const groqClient = apiKey
  ? new Groq({ apiKey })
  : null;

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export function requireGroq(): Groq {
  if (!groqClient) {
    throw new Error("GROQ_API_KEY environment variable is not configured. Set it in Replit Secrets to enable AI features.");
  }
  return groqClient;
}

export async function chatCompletion(
  systemPrompt: string,
  userContent: string,
  maxTokens = 512,
): Promise<string> {
  const client = requireGroq();
  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}
