import type { Theme } from "vitepress"
import DefaultTheme from "vitepress/theme"
import Preview from "./components/Preview.vue"
import PropList from "./components/PropList.vue"
import Home from "./components/Home.vue"
import "../../../src/style.css"
import "./custom.css"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Preview", Preview)
    app.component("PropList", PropList)
    app.component("Home", Home)
  },
} satisfies Theme
