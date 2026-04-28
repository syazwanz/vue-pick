import { defineConfig } from "vitest/config"
import vue2 from "@vitejs/plugin-vue2"
import * as compiler from "vue2/compiler-sfc"
import { resolve } from "path"

export default defineConfig({
  resolve: {
    alias: {
      vue: resolve(__dirname, "node_modules/vue2"),
      "@vue/test-utils": resolve(__dirname, "node_modules/test-utils-vue2"),
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [vue2({ compiler: compiler as never }) as any],
  test: {
    environment: "happy-dom",
    setupFiles: ["tests/vue2/setup.ts"],
    include: ["tests/vue2/**/*.test.ts"],
  },
})
