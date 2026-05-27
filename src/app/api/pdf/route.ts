import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url parameter is required" }, { status: 400 });
  }

  try {
    const response = await fetch(decodeURIComponent(url));
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=86400");

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 502 });
  }
}
