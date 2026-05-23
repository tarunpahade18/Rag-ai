import OpenAI from "openai";
import { getRequiredEnv } from "@/lib/env";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = getRequiredEnv("OPENAI_API_KEY");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function embedTexts(inputs: string[]) {
  console.log("🤖 embedTexts: starting OpenAI embedding for", inputs.length, "chunks");
  
  const client = getOpenAIClient();
  
  // Use text-embedding-3-small which outputs 1536 dimensions
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    dimensions: 1536,
    input: inputs,
  });
  
  console.log("🤖 embedTexts: response received, embeddings count =", response.data.length);

  return response.data.map((item) => item.embedding);
}