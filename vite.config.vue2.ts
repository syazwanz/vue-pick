import { defineConfig } from "vite"
import vue2 from "@vitejs/plugin-vue2"
import * as compiler from "vue2/compiler-sfc"
import dts from "vite-plugin-dts"
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
  plugins: [
    vue2({ compiler: compiler as never }),
    dts({
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, "tsconfig.json"),
      outDir: "dist",
      entryRoot: "src/vue2",
      insertTypesEntry: false,
      exclude: ["sandbox/**"],
    }),
  ],
})
