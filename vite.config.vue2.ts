import { defineConfig } from "vite"
import vue2 from "@vitejs/plugin-vue2"
import * as compiler from "vue2/compiler-sfc"
import { resolve } from "path"

export default defineConfig({
  resolve: {
    alias: {
      vue: resolve(__dirname, "node_modules/vue2"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/vue2/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => `vue2.${format === "es" ? "mjs" : "cjs"}`,
    },
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      external: ["vue"],
    },
  },
  // No dts plugin here on purpose. With `rollupTypes` it emitted its rolled-up
  // declarations as dist/index.d.ts, overwriting the Vue 3 types with Vue 2
  // ones that also carried unresolvable relative paths. The Vue 3 build already
  // emits both index.d.ts and vue2.d.ts correctly.
  plugins: [vue2({ compiler: compiler as never })],
})
