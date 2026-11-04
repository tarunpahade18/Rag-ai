import { createHash } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";

import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = new TextEncoder().encode(getRequiredEnv("JWT_SECRET"));
const CODE_TTL = "5m";
const ACCESS_TTL_SECONDS = 60 * 60;
const REFRESH_TTL = "30d";
const CLIENT_TTL = "365d";

export const OAUTH_SCOPE = "mcp";

export type OAuthClient = {
  clientId: string;
  clientName: string;
  redirectUris: string[];
  tokenEndpointAuthMethod: string;
};

export type OAuthCode = {
  userId: string;
  email: string;
  username: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scope: string;
};

export type OAuthSession = {
  userId: string;
  email: string;
  username: string;
  scope?: string;
  clientId?: string;
};

function base64url(value: Buffer) {
  return value.toString("base64url");
}

export function verifyPkce(codeVerifier: string, codeChallenge: string) {
  const digest = base64url(
    createHash("sha256").update(codeVerifier).digest(),
  );

  return digest === codeChallenge;
}

export async function createClientId({
  clientName,
  redirectUris,
  tokenEndpointAuthMethod,
}: {
  clientName: string;
  redirectUris: string[];
  tokenEndpointAuthMethod: string;
}) {
  return new SignJWT({
    kind: "oauth_client",
    client_name: clientName,
    redirect_uris: redirectUris,
    token_endpoint_auth_method: tokenEndpointAuthMethod,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(CLIENT_TTL)
    .sign(JWT_SECRET);
}

export async function verifyClientId(
  clientId: string,
): Promise<OAuthClient | null> {
  try {
    const { payload } = await jwtVerify(clientId, JWT_SECRET);

    if (
      payload.kind !== "oauth_client" ||
      !Array.isArray(payload.redirect_uris)
    ) {
      return null;
    }

    return {
      clientId,
      clientName:
        typeof payload.client_name === "string"
          ? payload.client_name
          : "MCP client",
      redirectUris: payload.redirect_uris.filter(
        (uri): uri is string => typeof uri === "string",
      ),
      tokenEndpointAuthMethod:
        typeof payload.token_endpoint_auth_method === "string"
          ? payload.token_endpoint_auth_method
          : "none",
    };
  } catch {
    return null;
  }
}

export async function createAuthorizationCode(code: OAuthCode) {
  return new SignJWT({
    kind: "oauth_code",
    userId: code.userId,
    email: code.email,
    username: code.username,
    client_id: code.clientId,
    redirect_uri: code.redirectUri,
    code_challenge: code.codeChallenge,
    scope: code.scope,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(CODE_TTL)
    .sign(JWT_SECRET);
}

export async function verifyAuthorizationCode(
  code: string,
): Promise<OAuthCode | null> {
  try {
    const { payload } = await jwtVerify(code, JWT_SECRET);

    if (
      payload.kind !== "oauth_code" ||
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.username !== "string" ||
      typeof payload.client_id !== "string" ||
      typeof payload.redirect_uri !== "string" ||
      typeof payload.code_challenge !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      clientId: payload.client_id,
      redirectUri: payload.redirect_uri,
      codeChallenge: payload.code_challenge,
      scope: typeof payload.scope === "string" ? payload.scope : OAUTH_SCOPE,
    };
  } catch {
    return null;
  }
}

async function signAccessToken(
  session: OAuthSession,
  clientId: string,
  kind: "oauth_access" | "oauth_refresh",
  expiresIn: string,
) {
  return new SignJWT({
    kind,
    userId: session.userId,
    email: session.email,
    username: session.username,
    client_id: clientId,
    scope: session.scope ?? OAUTH_SCOPE,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function createAccessToken(
  session: OAuthSession,
  clientId: string,
) {
  return signAccessToken(session, clientId, "oauth_access", "1h");
}

export async function createRefreshToken(
  session: OAuthSession,
  clientId: string,
) {
  return signAccessToken(session, clientId, "oauth_refresh", REFRESH_TTL);
}

export async function verifyRefreshToken(
  token: string,
): Promise<OAuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (
      payload.kind !== "oauth_refresh" ||
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.username !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      scope: typeof payload.scope === "string" ? payload.scope : OAUTH_SCOPE,
      clientId:
        typeof payload.client_id === "string" ? payload.client_id : undefined,
    };
  } catch {
    return null;
  }
}

export const OAUTH_ACCESS_TTL_SECONDS = ACCESS_TTL_SECONDS;
