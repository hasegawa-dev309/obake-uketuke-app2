import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    host: true,
    port: 5174,
    strictPort: true,
    hmr: { protocol: "ws", host: "localhost", clientPort: 5174 },
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
    },
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        admin: resolve(__dirname, "admin.html"),
        reservation: resolve(__dirname, "reservation.html"),
      },
    },
  },
}));
