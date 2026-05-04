import type { NextConfig } from "next";

// allow self-signed dev certs when Next.js proxies to the backend via rewrites.
if (process.env.NODE_ENV === "development") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      { hostname: "**", pathname: "/api/images/**" },
    ],
  },
  async rewrites() {
    const backendUrl =
      process.env.services__server__http__0 ??
      process.env.services__server__https__0 ??
      "https://localhost:7485";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
