import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: [
      "src/tests/**/*.test.{ts,tsx}",
      "../../tests/**/*.test.{ts,tsx}"
    ],
    setupFiles: [path.resolve(import.meta.dirname, "src/tests/setup.ts")],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "../../attached_assets"),
      "~api": path.resolve(import.meta.dirname, "../api-server/src"),
      "~db": path.resolve(import.meta.dirname, "../../lib/db/src"),
    },
  },
});
