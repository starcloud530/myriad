import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const myriadRoot = resolve(__dirname, "../..");

export default defineConfig({
  plugins: [react()],
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
