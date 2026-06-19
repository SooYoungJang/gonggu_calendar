import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "dist/**",
        "**/index.ts",
        "src/constants/**",
        "src/hooks/**",
        "src/utils/api-client.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 50,
        branches: 60,
        statements: 70,
      },
    },
  },
});