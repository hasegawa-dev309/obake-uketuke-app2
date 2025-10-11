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
      "/api": { 
        target: "https://obake-uketuke-app-ae91e2b5463a.herokuapp.com", 
        changeOrigin: true,
        secure: true,
      },
    },
  },

  build: {
    outDir: "dist",
    base: '/',
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
        reservation: resolve(__dirname, "reservation.html"),
        reservationComplete: resolve(__dirname, "reservation-complete.html"),
      },
    },
  },
}));