import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { resolve } from "path"

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/vue3/index.ts"),
        vue2: resolve(__dirname, "src/vue2/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const ext = format === "es" ? "mjs" : "cjs"
        return `${entryName}.${ext}`
      },
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, "tsconfig.json"),
    }),
  ],
})
