import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import {
  searchDocuments,
  ToolError,
  type SearchToolArgs,
} from "@/lib/plugin-tools";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as SearchToolArgs;
    const result = await searchDocuments(session.userId, body);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ToolError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Search request failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
