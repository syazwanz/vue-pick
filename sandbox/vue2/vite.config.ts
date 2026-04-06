import { defineConfig } from "vite"
import vue2 from "@vitejs/plugin-vue2"
import * as compiler from "vue2/compiler-sfc"
import { resolve } from "path"

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      vue: resolve(__dirname, "../../node_modules/vue2"),
    },
  },
  plugins: [vue2({ compiler: compiler as never })],
})
