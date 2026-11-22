/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    // The dev server forwards API calls, so the app and the API share an address
    // (localhost:5173), as in production. The session cookie needs that.
    proxy: {
      "/api": loadEnv(mode, ".", "").VITE_API_URL || "http://localhost:8080",
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Icons used only by lazily loaded pages would otherwise each become a
          // ~0.1 kB file of their own; keep them together in one small chunk.
          groups: [{ name: "icons", test: /node_modules[\\/]lucide-react/ }],
        },
      },
    },
  },
  test: {
    // Pure-logic tests only (no DOM), like utility-hub-mobile's lib tests.
    environment: "node",
    // One fixed time zone so date logic behaves the same on any machine. New York is
    // behind UTC, so "UTC vs local date" bugs show up (same choice as mobile).
    env: { TZ: "America/New_York" },
    include: ["src/**/*.test.js"],
  },
}));
