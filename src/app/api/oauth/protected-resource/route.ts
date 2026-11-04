import { NextResponse } from "next/server";

import { getPluginBaseUrl } from "@/lib/plugin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getPluginBaseUrl(request);

  return NextResponse.json(
    {
      resource: `${baseUrl}/api/mcp`,
      authorization_servers: [baseUrl],
      scopes_supported: ["mcp"],
      bearer_methods_supported: ["header"],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
