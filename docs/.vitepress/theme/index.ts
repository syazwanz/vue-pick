import type { Theme } from "vitepress"
import DefaultTheme from "vitepress/theme"
import Preview from "./components/Preview.vue"
import "../../../src/style.css"
import "./custom.css"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Preview", Preview)
  },
} satisfies Theme
