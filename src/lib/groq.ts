import Groq from "groq-sdk";

import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

let groqClient: Groq | null = null;

export function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: getRequiredEnv("GROQ_API_KEY"),
    });
  }

  return groqClient;
}

export function getGroqModel() {
  return getOptionalEnv("GROQ_MODEL", "llama-3.3-70b-versatile")!;
}
