import js from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginVue from "eslint-plugin-vue"
import prettier from "eslint-config-prettier"

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  prettier,
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      "ref.local/",
      "docs/.vitepress/cache/",
      "docs/.vitepress/dist/",
    ],
  },
  {
    rules: {
      "vue/first-attribute-linebreak": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/html-indent": "off",
    },
  },
  {
    // Vue 2 reuses an element across v-if/v-else branches when neither carries
    // a key, which can leak state between them. Vue 3 auto-assigns branch keys,
    // so `flat/recommended` leaves this off; the Vue 2 adapter still needs it.
    // Note this does NOT catch two branches sharing the same key — no rule
    // does, only the editor language service.
    files: ["src/vue2/**/*.vue"],
    rules: {
      "vue/v-if-else-key": "error",
    },
  },
  {
    files: ["docs/**/*.{vue,ts,js}", "sandbox/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      globals: {
        Event: "readonly",
        FormData: "readonly",
        HTMLElement: "readonly",
        HTMLSelectElement: "readonly",
        HTMLFormElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLInputElement: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        Node: "readonly",
        TouchEvent: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        getComputedStyle: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
      },
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
)
