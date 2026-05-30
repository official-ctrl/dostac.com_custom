import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

function lowercaseRedirectPlugin() {
  return {
    name: "lowercase-redirect",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "/";
        const [pathname, search] = url.split("?") as [string, string | undefined];
        const lower = pathname.toLowerCase();
        if (lower !== pathname) {
          const location = lower + (search != null ? `?${search}` : "");
          res.writeHead(301, { Location: location });
          res.end();
          return;
        }
        next();
      });
    },
    configurePreviewServer(server: import("vite").PreviewServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "/";
        const [pathname, search] = url.split("?") as [string, string | undefined];
        const lower = pathname.toLowerCase();
        if (lower !== pathname) {
          const location = lower + (search != null ? `?${search}` : "");
          res.writeHead(301, { Location: location });
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    lowercaseRedirectPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
