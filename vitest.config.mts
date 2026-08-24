import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node rather than jsdom: the logic under test is server-side business
    // logic, not component rendering.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
