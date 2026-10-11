import OpenAI from "openai";
import { getRequiredEnv } from "@/lib/env";

let openRouterClient: OpenAI | null = null;

function getOpenRouterClient() {
  if (!openRouterClient) {
    const apiKey = getRequiredEnv("OPENROUTER_API_KEY").trim();
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is blank. Re-enter it in the hosting dashboard without surrounding spaces.",
      );
    }
    console.log("🤖 OpenRouter key length:", apiKey.length);
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

export async function embedTexts(inputs: string[]) {
  console.log("🤖 embedTexts: starting OpenRouter embedding for", inputs.length, "chunks");

  const client = getOpenRouterClient();

  const response = await client.embeddings.create({
    model: "openai/text-embedding-3-small",
    dimensions: 1536,
    input: inputs,
  });

  console.log("🤖 embedTexts: response received, embeddings count =", response.data.length);

  return response.data.map((item) => item.embedding);
}
