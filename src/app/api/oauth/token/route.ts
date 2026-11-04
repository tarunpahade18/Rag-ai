import { NextRequest, NextResponse } from "next/server";

import {
  createAccessToken,
  createRefreshToken,
  OAUTH_ACCESS_TTL_SECONDS,
  verifyAuthorizationCode,
  verifyPkce,
  verifyRefreshToken,
} from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
};

function oauthError(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    { status, headers: NO_STORE_HEADERS },
  );
}

async function readParams(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, string>;
  }

  const form = await request.formData().catch(() => null);
  const params: Record<string, string> = {};

  if (form) {
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") {
        params[key] = value;
      }
    }
  }

  return params;
}

export async function POST(request: NextRequest) {
  const params = await readParams(request);
  const grantType = params.grant_type;

  if (grantType === "authorization_code") {
    const code = params.code;
    const clientId = params.client_id;
    const redirectUri = params.redirect_uri;
    const codeVerifier = params.code_verifier;

    if (!code || !clientId || !redirectUri || !codeVerifier) {
      return oauthError(
        "invalid_request",
        "code, client_id, redirect_uri, and code_verifier are required.",
      );
    }

    const authorizationCode = await verifyAuthorizationCode(code);

    if (!authorizationCode) {
      return oauthError(
        "invalid_grant",
        "The authorization code is invalid or expired.",
      );
    }

    if (authorizationCode.clientId !== clientId) {
      return oauthError("invalid_grant", "client_id does not match the code.");
    }

    if (authorizationCode.redirectUri !== redirectUri) {
      return oauthError(
        "invalid_grant",
        "redirect_uri does not match the code.",
      );
    }

    if (!verifyPkce(codeVerifier, authorizationCode.codeChallenge)) {
      return oauthError("invalid_grant", "PKCE verification failed.");
    }

    const session = {
      userId: authorizationCode.userId,
      email: authorizationCode.email,
      username: authorizationCode.username,
      scope: authorizationCode.scope,
    };

    const accessToken = await createAccessToken(session, clientId);
    const refreshToken = await createRefreshToken(session, clientId);

    return NextResponse.json(
      {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: OAUTH_ACCESS_TTL_SECONDS,
        refresh_token: refreshToken,
        scope: authorizationCode.scope,
      },
      { headers: NO_STORE_HEADERS },
    );
  }

  if (grantType === "refresh_token") {
    const refreshToken = params.refresh_token;
    const clientId = params.client_id;

    if (!refreshToken) {
      return oauthError(
        "invalid_request",
        "refresh_token is required.",
      );
    }

    const session = await verifyRefreshToken(refreshToken);

    if (!session) {
      return oauthError(
        "invalid_grant",
        "The refresh token is invalid or expired.",
      );
    }

    if (clientId && session.clientId && clientId !== session.clientId) {
      return oauthError("invalid_grant", "client_id does not match the token.");
    }

    const accessToken = await createAccessToken(session, clientId ?? "");
    const nextRefreshToken = await createRefreshToken(
      session,
      clientId ?? session.clientId ?? "",
    );

    return NextResponse.json(
      {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: OAUTH_ACCESS_TTL_SECONDS,
        refresh_token: nextRefreshToken,
        scope: session.scope,
      },
      { headers: NO_STORE_HEADERS },
    );
  }

  return oauthError(
    "unsupported_grant_type",
    "Only authorization_code and refresh_token are supported.",
  );
}
