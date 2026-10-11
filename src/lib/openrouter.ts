import OpenAI from "openai";

import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

let openRouterClient: OpenAI | null = null;

export function getOpenRouterClient() {
  if (!openRouterClient) {
    openRouterClient = new OpenAI({
      apiKey: getRequiredEnv("OPENROUTER_API_KEY"),
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://www.llmlite.xyz",
        "X-Title": "Legal AI",
      },
    });
  }

  return openRouterClient;
}

export function getChatModel() {
  return getOptionalEnv(
    "OPENROUTER_CHAT_MODEL",
    "meta-llama/llama-3.3-70b-versatile",
  )!;
}
