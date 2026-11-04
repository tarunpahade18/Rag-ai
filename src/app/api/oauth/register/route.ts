import { NextResponse } from "next/server";

import { createClientId } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function isValidRedirectUri(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        (url.hostname === "localhost" || url.hostname === "127.0.0.1"))
    );
  } catch {
    return false;
  }
}

function metadataError(description: string) {
  return NextResponse.json(
    {
      error: "invalid_client_metadata",
      error_description: description,
    },
    { status: 400, headers: CORS_HEADERS },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return metadataError("Request body must be valid JSON.");
  }

  const redirectUris = Array.isArray(body.redirect_uris)
    ? body.redirect_uris.filter(isValidRedirectUri)
    : [];

  if (!redirectUris.length) {
    return metadataError(
      "redirect_uris must contain at least one HTTPS URL (or localhost).",
    );
  }

  const clientName =
    typeof body.client_name === "string" && body.client_name.trim()
      ? body.client_name.trim().slice(0, 120)
      : "MCP client";

  const clientId = await createClientId({
    clientName,
    redirectUris,
    tokenEndpointAuthMethod: "none",
  });

  return NextResponse.json(
    {
      client_id: clientId,
      client_name: clientName,
      redirect_uris: redirectUris,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    {
      status: 201,
      headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
    },
  );
}
