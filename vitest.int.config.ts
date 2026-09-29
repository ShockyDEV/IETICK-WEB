import { defineConfig } from "vitest/config";
import path from "node:path";

/** Pruebas de integración del panel contra PostgreSQL (`npm run test:int`). */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.int.test.ts"],
    setupFiles: ["src/test/integration-setup.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "src/test/server-only.ts"),
    },
  },
});
