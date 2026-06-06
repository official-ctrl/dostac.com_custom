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
  async redirects() {
    return [
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
