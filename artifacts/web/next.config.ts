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
      // /notice → blog (단일 홉으로 단축)
      {
        source: "/notice",
        destination: "https://blog.dostac.com",
        permanent: true,
      },
      {
        source: "/notice/:slug",
        destination: "https://blog.dostac.com/:slug",
        permanent: true,
      },
      // /insights → blog (슬러그 구조 동일: blog.dostac.com/[slug])
      {
        source: "/insights",
        destination: "https://blog.dostac.com",
        permanent: true,
      },
      {
        source: "/insights/:slug",
        destination: "https://blog.dostac.com/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
