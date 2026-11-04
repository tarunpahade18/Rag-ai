import { NextResponse } from "next/server";

import { getPluginBaseUrl } from "@/lib/plugin";
import { buildOpenApiSpec } from "@/lib/plugin-openapi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getPluginBaseUrl(request);

  return NextResponse.json(buildOpenApiSpec(baseUrl), {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
