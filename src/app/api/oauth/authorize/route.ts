import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import {
  createAuthorizationCode,
  OAUTH_SCOPE,
  verifyClientId,
} from "@/lib/oauth";
import { getPluginBaseUrl } from "@/lib/plugin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const responseType = params.get("response_type");
  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");
  const codeChallenge = params.get("code_challenge");
  const codeChallengeMethod = params.get("code_challenge_method") ?? "S256";
  const state = params.get("state") ?? "";
  const scope = params.get("scope") ?? OAUTH_SCOPE;

  if (
    responseType !== "code" ||
    !clientId ||
    !redirectUri ||
    !codeChallenge ||
    codeChallengeMethod !== "S256"
  ) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description:
          "response_type=code, client_id, redirect_uri, code_challenge, and S256 are required.",
      },
      { status: 400 },
    );
  }

  const client = await verifyClientId(clientId);

  if (!client) {
    return NextResponse.json(
      {
        error: "invalid_client",
        error_description: "Unknown or expired client_id.",
      },
      { status: 400 },
    );
  }

  if (!client.redirectUris.includes(redirectUri)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "redirect_uri does not match the registered client.",
      },
      { status: 400 },
    );
  }

  const session = await getSession();

  if (!session) {
    const loginUrl = new URL("/auth", getPluginBaseUrl(request));
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  const code = await createAuthorizationCode({
    userId: session.userId,
    email: session.email,
    username: session.username,
    clientId,
    redirectUri,
    codeChallenge,
    scope,
  });

  const target = new URL(redirectUri);
  target.searchParams.set("code", code);
  if (state) target.searchParams.set("state", state);

  return NextResponse.redirect(target);
}
