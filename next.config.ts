import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mammoth"],
  turbopack: {
    root: path.join(process.cwd()),
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/ai-plugin.json",
        destination: "/api/plugin/manifest",
      },
      {
        source: "/openapi.json",
        destination: "/api/plugin/openapi",
      },
      {
        source: "/.well-known/oauth-authorization-server",
        destination: "/api/oauth/authorization-server",
      },
      {
        source: "/.well-known/oauth-protected-resource",
        destination: "/api/oauth/protected-resource",
      },
      {
        source: "/.well-known/oauth-protected-resource/:path*",
        destination: "/api/oauth/protected-resource",
      },
      {
        source: "/.well-known/openai-apps-challenge",
        destination: "/api/oauth/challenge",
      },
    ];
  },
};

export default nextConfig;
