import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [vue() as any],
  test: {
    environment: "happy-dom",
    exclude: ["tests/vue2/**", "node_modules/**"],
  },
})
