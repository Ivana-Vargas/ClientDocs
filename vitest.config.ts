import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    fileParallelism: false,
    include: ["src/**/*.spec.ts", "src/**/*.integration.spec.ts"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@server": path.resolve(__dirname, "src/server"),
      "@database": path.resolve(__dirname, "src/database"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
})
