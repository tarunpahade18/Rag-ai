import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.OPENAI_APPS_CHALLENGE_TOKEN?.trim();

  if (!token) {
    return new NextResponse("Challenge token is not configured.", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse(token, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-store",
    },
  });
}
