import { getChatModel, getOpenRouterClient } from "@/lib/openrouter";
import type { LegalSource } from "@/lib/rag";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT =
  "You are a legal document assistant. Answer only from the supplied document excerpts. If the excerpts do not support a claim, say that clearly. Keep the answer concise, professional, and cite the source blocks with bracketed numbers like [1] or [2]. Do not invent statutes, clauses, or facts.";

export function formatSourcesForPrompt(sources: LegalSource[]) {
  return sources
    .map(
      (source, index) =>
        `[${index + 1}] ${source.sourceName} | chunk ${source.chunkIndex + 1}\n${source.text}`,
    )
    .join("\n\n");
}

export function getAssistantText(
  content:
    | string
    | Array<{ type?: string; text?: string | null }>
    | null
    | undefined,
) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => ("text" in item && item.text ? item.text : ""))
      .join("")
      .trim();
  }

  return "";
}

export async function generateGroundedAnswer({
  question,
  sources,
  history = [],
}: {
  question: string;
  sources: LegalSource[];
  history?: ChatHistoryMessage[];
}) {
  const openrouter = getOpenRouterClient();
  const completion = await openrouter.chat.completions.create({
    model: getChatModel(),
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-6).map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: "user",
        content: `Question: ${question}\n\nSource excerpts:\n${formatSourcesForPrompt(
          sources,
        )}`,
      },
    ],
  });

  return (
    getAssistantText(completion.choices[0]?.message?.content) ||
    "I found relevant passages, but the model did not return a usable answer."
  );
}
