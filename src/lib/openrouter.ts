import OpenAI from "openai";

import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

let openRouterClient: OpenAI | null = null;

export function getOpenRouterClient() {
  if (!openRouterClient) {
    const apiKey = getRequiredEnv("OPENROUTER_API_KEY").trim();
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is blank. Re-enter it in the hosting dashboard without surrounding spaces.",
      );
    }
    openRouterClient = new OpenAI({
      apiKey,
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
    "deepseek/deepseek-v4.1-flash",
  )!;
}
