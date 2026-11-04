import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"
);

const publicPaths = [
  "/auth",
  "/legal",
  "/api/auth",
  "/api/plugin/manifest",
  "/api/plugin/openapi",
  "/api/plugin/tools",
  "/api/mcp",
  "/openapi.json",
  "/plugin-logo.png",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") {
    return true;
  }

  if (pathname.startsWith("/.well-known/")) {
    return true;
  }

  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

async function isValidJwt(token: string) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  if (
    isPublicPath(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  if (pathname.startsWith("/api/")) {
    if (bearerToken) {
      // Plugin API keys are opaque tokens checked against the database in
      // getSession(); JWTs can be verified here without a database lookup.
      if (bearerToken.startsWith("sk_plugin_")) {
        return NextResponse.next();
      }

      return (await isValidJwt(bearerToken))
        ? NextResponse.next()
        : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!token || !(await isValidJwt(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (await isValidJwt(token)) {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(new URL("/auth", request.url));
  response.cookies.delete("auth-token");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
