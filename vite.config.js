/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
});
