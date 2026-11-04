import { NextResponse } from "next/server";

import { buildPluginManifest, getPluginBaseUrl } from "@/lib/plugin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getPluginBaseUrl(request);

  return NextResponse.json(buildPluginManifest(baseUrl), {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
