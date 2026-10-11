import { NextResponse } from "next/server";

import { validateServerEnv } from "@/lib/env";
import { getChatModel, getOpenRouterClient } from "@/lib/openrouter";
import { retrieveSources } from "@/lib/rag";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function formatSourcesForPrompt(
  sources: Awaited<ReturnType<typeof retrieveSources>>,
) {
  return sources
    .map(
      (source, index) =>
        `[${index + 1}] ${source.sourceName} | chunk ${source.chunkIndex + 1}\n${source.text}`,
    )
    .join("\n\n");
}

function getAssistantText(
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

export async function POST(request: Request) {
  try {
    validateServerEnv();

    const body = (await request.json()) as {
      messages?: ChatMessage[];
      vaultId?: string;
      folderId?: string;
      question?: string;
    };

    const vaultId = body.vaultId?.trim();
    const folderId = body.folderId?.trim();
    const question = body.question?.trim();
    const messages = (body.messages ?? []).slice(-6);

    if (!vaultId || !folderId || !question) {
      return NextResponse.json(
        { error: "vaultId, folderId, and question are all required." },
        { status: 400 },
      );
    }

    const sources = await retrieveSources({
      vaultId,
      folderId,
      query: question,
    });
console.log(sources);

    if (!sources.length) {
      return NextResponse.json({
        answer:
          "I could not find supporting passages in the uploaded documents for that question.",
        sources: [],
      });
    }

    const openrouter = getOpenRouterClient();
    const completion = await openrouter.chat.completions.create({
      model: getChatModel(),
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a legal document assistant. Answer only from the supplied document excerpts. If the excerpts do not support a claim, say that clearly. Keep the answer concise, professional, and cite the source blocks with bracketed numbers like [1] or [2]. Do not invent statutes, clauses, or facts.",
        },
        ...messages.map((message) => ({
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

    const answer = getAssistantText(completion.choices[0]?.message?.content);

    return NextResponse.json({
      answer:
        answer ||
        "I found relevant passages, but the model did not return a usable answer.",
      sources,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat request failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}