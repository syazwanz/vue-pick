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
        document: "readonly",
      },
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
)
