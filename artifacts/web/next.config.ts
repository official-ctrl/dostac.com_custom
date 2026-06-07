import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@workspace/api-client-react",
    "@workspace/api-zod",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      // 구 /notice URL → /insights (내부 헤드리스 블로그 페이지)
      {
        source: "/notice",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/notice/:slug",
        destination: "/insights/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
