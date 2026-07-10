import Groq from "groq-sdk";
import { logger } from "./logger";

const apiKey1 = process.env["GROQ_API_KEY"];
const apiKey2 = process.env["GROQ_API_KEY_2"];

if (!apiKey1 && !apiKey2) {
  logger.warn(
    "Neither GROQ_API_KEY nor GROQ_API_KEY_2 is set — AI endpoints will return an error until at least one is configured",
  );
}

const clients: Groq[] = [];
if (apiKey1) clients.push(new Groq({ apiKey: apiKey1 }));
if (apiKey2) clients.push(new Groq({ apiKey: apiKey2 }));

let currentIndex = 0;

/** Returns the next available Groq client, rotating between configured keys */
export function requireGroq(): Groq {
  if (clients.length === 0) {
    throw new Error(
      "No Groq API key is configured. Set GROQ_API_KEY (and optionally GROQ_API_KEY_2) in Replit Secrets.",
    );
  }
  const client = clients[currentIndex % clients.length]!;
  currentIndex = (currentIndex + 1) % clients.length;
  return client;
}

export const GROQ_MODEL = "llama-3.3-70b-versatile";

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
