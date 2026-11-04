import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mammoth"],
  turbopack: {
    root: path.join(__dirname),
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
    ];
  },
};

export default nextConfig;
