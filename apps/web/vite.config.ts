import { copyFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const myriadRoot = resolve(__dirname, "../..");

function spaFallback() {
  return {
    name: "spa-fallback",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
      writeFileSync(resolve(dist, ".nojekyll"), "");
    },
    // index.html is written before closeBundle; 404.html is the SPA fallback for GitHub Pages.
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react(), spaFallback()],
  server: {
    host: "127.0.0.1",
    port: 18081,
    strictPort: true,
    fs: {
      allow: [__dirname, resolve(myriadRoot, "catalog")],
    },
    proxy: {
      "/health": "http://127.0.0.1:8791",
      "/v1": "http://127.0.0.1:8791",
    },
  },
});
