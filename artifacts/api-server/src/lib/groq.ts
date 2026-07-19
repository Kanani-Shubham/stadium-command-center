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

/**
 * Round-robin key rotation: returns the next available Groq client,
 * rotating between configured primary and secondary keys to double API rate limits.
 * 
 * @returns An initialized Groq client instance
 * @throws An error if no keys are configured in the environment
 */
export function requireGroq(): Groq {
  if (clients.length === 0) {
    throw new Error(
      "No Groq API key is configured. Set GROQ_API_KEY (and optionally GROQ_API_KEY_2) in environment variables.",
    );
  }
  const client = clients[currentIndex % clients.length]!;
  currentIndex = (currentIndex + 1) % clients.length;
  return client;
}

/**
 * Standard Llama-3.3 70B model chosen for high accuracy JSON reasoning and low latency.
 */
export const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Invokes the Groq SDK chat completions API with the configured model.
 * 
 * @param systemPrompt - Instructions defining the AI role and context rules
 * @param userContent - The specific user request/metrics payload
 * @param maxTokens - Output token limit (defaults to 512)
 * @returns The string response content returned by the model
 */
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
