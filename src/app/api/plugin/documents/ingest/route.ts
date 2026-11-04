import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import {
  ingestTextDocument,
  ToolError,
  type IngestToolArgs,
} from "@/lib/plugin-tools";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as IngestToolArgs;
    const result = await ingestTextDocument(session.userId, body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ToolError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Document import failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
