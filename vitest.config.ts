import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: ["tests/**", "node_modules/**"],
    coverage: { reporter: ["text"] },
  },
});
