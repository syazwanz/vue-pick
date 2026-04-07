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
    ignores: ["dist/", "node_modules/", "coverage/"],
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
        HTMLSelectElement: "readonly",
        HTMLFormElement: "readonly",
      },
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
)
