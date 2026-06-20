import type { NextConfig } from "next";

const isCloudflarePages = process.env.CF_PAGES === "1";

const nextConfig: NextConfig = {
  // standalone: Docker/Replit용. Cloudflare Pages는 output 없음
  ...(isCloudflarePages ? {} : { output: "standalone" }),
  transpilePackages: [
    "@workspace/api-client-react",
    "@workspace/api-zod",
  ],
  images: {
    /* Modern formats — AVIF first (best compression), fallback to WebP */
    formats: ["image/avif", "image/webp"],
    /* Responsive breakpoints (matches our useGlobeSize / hero pattern) */
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    /* Cache optimized variants 31 days */
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  /* Tree-shake icon/animation packages — only used icons land in bundle */
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
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
