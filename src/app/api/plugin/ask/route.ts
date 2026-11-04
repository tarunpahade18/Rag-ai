import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import {
  askDocuments,
  ToolError,
  type AskToolArgs,
} from "@/lib/plugin-tools";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as AskToolArgs;
    const result = await askDocuments(session.userId, body);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ToolError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Plugin request failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
