import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { getRequiredEnv } from "./env";
import { isPluginApiKey, verifyApiKey } from "./api-keys";

const JWT_SECRET = new TextEncoder().encode(getRequiredEnv("JWT_SECRET"));
const COOKIE_NAME = "auth-token";

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  kind?: string;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const session = await verifyToken(token);
    if (session && (!session.kind || session.kind === "oauth_access")) {
      return session;
    }
  }
  
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7);

    if (isPluginApiKey(bearerToken)) {
      return verifyApiKey(bearerToken);
    }

    const session = await verifyToken(bearerToken);

    if (session?.kind && session.kind !== "oauth_access") {
      return null;
    }

    return session;
  }
  
  return null;
}

export function setAuthCookie(token: string) {
  return `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
}