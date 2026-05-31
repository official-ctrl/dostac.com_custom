import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT ?? "5173");
const basePath = process.env.BASE_PATH ?? "/";

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
