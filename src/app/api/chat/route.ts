import { NextResponse } from "next/server";

import { generateGroundedAnswer, type ChatHistoryMessage } from "@/lib/answer";
import { validateServerEnv } from "@/lib/env";
import { retrieveSources } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validateServerEnv();

    const body = (await request.json()) as {
      messages?: ChatHistoryMessage[];
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

    if (!sources.length) {
      return NextResponse.json({
        answer:
          "I could not find supporting passages in the uploaded documents for that question.",
        sources: [],
      });
    }

    const answer = await generateGroundedAnswer({
      question,
      sources,
      history: messages,
    });

    return NextResponse.json({ answer, sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat request failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
