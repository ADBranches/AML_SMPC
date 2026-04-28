import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api/regulator": {
        target: "http://127.0.0.1:8085",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/regulator/, ""),
      },
      "/api/encryption": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/encryption/, ""),
      },
      "/api/he": {
        target: "http://127.0.0.1:8082",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/he/, ""),
      },
      "/api/smpc": {
        target: "http://127.0.0.1:8083",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/smpc/, ""),
      },
      "/smpc-api": {
        target: "http://127.0.0.1:8083",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/smpc-api/, ""),
      },
      "/api/zk": {
        target: "http://127.0.0.1:8084",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/zk/, ""),
      },
    },
  },
});
