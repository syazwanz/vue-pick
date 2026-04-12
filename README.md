# Vue Pick

![NPM Version](https://img.shields.io/npm/v/vue-pick) ![npm downloads](https://img.shields.io/npm/dm/vue-pick) ![GitHub stars](https://img.shields.io/github/stars/syazwanz/vue-pick)

**Accessible select components for Vue 2.7 and Vue 3. Zero dependencies.**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/vue-pick-demo?file=src%2FApp.vue)

- Zero dependencies
- Native `<select>` wrapper and custom dropdown
- Fully accessible
- Same API in Vue 2.7 and Vue 3
- Customizable via CSS custom properties and slots
- ~11 KB minified, ~3 KB gzipped

## Install

```bash
npm install vue-pick
# or
pnpm add vue-pick
```

Then import the stylesheet once in your app entry. See [Theming & CSS](#theming--css) for other import strategies.

```ts
import "vue-pick/style.css"
```

## Components

| Component     | Status            | Description                                                       |
| ------------- | ----------------- | ----------------------------------------------------------------- |
| `VPickNative` | Available         | A styled wrapper around the native `<select>` element             |
| `VPick`       | Available (Vue 3) | A custom dropdown triggered by a button, with keyboard navigation |

> **Note:** `VPick` is Vue 3 only in the current release. A Vue 2 port is coming in the next version. `VPickNative` is available for both Vue 2.7 and Vue 3.

### Which one should I use?

- Use **`VPickNative`** for native browser behavior, better mobile UX, and simpler integration.
- Use **`VPick`** for custom styling, group labels, and separators.

## VPickNative

A styled wrapper around the native `<select>` element. Same browser behavior, consistent design.

```vue
<script setup>
import { ref } from "vue"
import { VPickNative } from "vue-pick"

const selected = ref(null)
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <VPickNative v-model="selected" :options="options" placeholder="Select status" />
</template>
```

> **Vue 2.7:** same code, just change the import to `import { VPickNative } from "vue-pick/vue2"`.

## VPick

A custom dropdown triggered by a button, with full keyboard navigation and group labels. Accepts the same `options` shape as `VPickNative`.

```vue
<script setup>
import { ref } from "vue"
import { VPick } from "vue-pick"

const selected = ref(null)
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <VPick v-model="selected" :options="options" placeholder="Select status" />
</template>
```

## Options

The `options` prop accepts a flat array of items, or a nested array with groups. Both components share the same shape.

### Flat

```js
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done", disabled: true },
]
```

### Grouped

Groups are detected automatically when an item has an `options` array. Both components render them accessibly with a group label.

```js
const options = [
  {
    label: "Engineering",
    options: [
      { label: "Frontend", value: "frontend" },
      { label: "Backend", value: "backend" },
    ],
  },
  {
    label: "Sales",
    options: [
      { label: "Sales Rep", value: "sales-rep" },
      { label: "Account Manager", value: "account-manager", disabled: true },
    ],
  },
]
```

## Props

These props apply to both `VPickNative` and `VPick` unless noted otherwise.

| Prop                   | Type                | Default      | Description                                              |
| ---------------------- | ------------------- | ------------ | -------------------------------------------------------- |
| `modelValue` / `value` | `any`               | `undefined`  | Selected value. Use `v-model` for two-way binding.       |
| `options`              | `OptionOrGroup[]`   | **required** | Array of options or option groups.                       |
| `placeholder`          | `string`            | `undefined`  | Placeholder text shown when no value is selected.        |
| `disabled`             | `boolean`           | `false`      | Disables the select.                                     |
| `loading`              | `boolean`           | `false`      | Shows a spinner and disables the select.                 |
| `error`                | `string`            | `undefined`  | Error message. Applies error styling and `aria-invalid`. |
| `size`                 | `"default" \| "sm"` | `"default"`  | Size variant.                                            |
| `id`                   | `string`            | `undefined`  | HTML `id` attribute.                                     |
| `name`                 | `string`            | `undefined`  | HTML `name` attribute for form submission.               |
| `required`             | `boolean`           | `false`      | HTML `required` attribute.                               |
| `ariaLabel`            | `string`            | `undefined`  | `aria-label` for accessibility.                          |
| `ariaDescribedby`      | `string`            | `undefined`  | `aria-describedby` for accessibility.                    |

### VPick-only props

| Prop         | Type      | Default | Description                                                                |
| ------------ | --------- | ------- | -------------------------------------------------------------------------- |
| `separators` | `boolean` | `false` | Renders a horizontal divider between every adjacent group in the dropdown. |
| `rotateIcon` | `boolean` | `false` | Rotates the trigger chevron 180° when the dropdown is open.                |

## Slots

| Slot      | Description                                             |
| --------- | ------------------------------------------------------- |
| `icon`    | Custom chevron icon. Shown when not loading.            |
| `loading` | Custom loading indicator. Shown when `loading` is true. |

```vue
<VPickNative :options="options">
  <template #icon>
    <MyCustomChevron />
  </template>
</VPickNative>
```

## Theming & CSS

`vue-pick` uses CSS custom properties (variables) for all styling. You must import the default CSS for the component to render correctly.

### Importing the CSS

Choose the import method that matches your project structure.

#### 1. Global Import

Import the CSS once in your main entry file (like main.js or main.ts). This is the best approach for consistency, ensuring styles are loaded before any component renders.

```ts
import { createApp } from "vue"
import App from "./App.vue"
import "vue-pick/style.css"

createApp(App).mount("#app")
```

#### 2. Main Stylesheet Import

If you manage a central CSS file, you can import it there. This keeps all your third party style imports organized in one place.

```css
/* main.css */
@import "vue-pick/style.css";

body {
  margin: 0;
}
```

#### 3. Component Level Import

Import the CSS inside the specific .vue file. Use this if you prefer co-locating the import with the component that uses it.

```vue
<script setup>
import { VPickNative } from "vue-pick"
import "vue-pick/style.css"
</script>
```

### Customizing the Theme

Override these CSS variables to customize the appearance.

#### Shared (both `VPickNative` and `VPick`)

| Variable                     | Default                    |
| ---------------------------- | -------------------------- |
| `--vpick-font-family`        | `inherit`                  |
| `--vpick-font-size`          | `0.875rem`                 |
| `--vpick-line-height`        | `1.25rem`                  |
| `--vpick-width`              | `fit-content`              |
| `--vpick-border-color`       | `#e5e5e5`                  |
| `--vpick-border-radius`      | `0.625rem`                 |
| `--vpick-bg`                 | `transparent`              |
| `--vpick-text-color`         | `inherit`                  |
| `--vpick-placeholder-color`  | `#737373`                  |
| `--vpick-icon-color`         | `#737373`                  |
| `--vpick-focus-border-color` | `#a1a1a1`                  |
| `--vpick-focus-ring-color`   | `rgba(161, 161, 161, 0.5)` |
| `--vpick-error-border-color` | `#dc2626`                  |
| `--vpick-error-bg`           | `rgba(220, 38, 38, 0.05)`  |
| `--vpick-error-ring-color`   | `rgba(220, 38, 38, 0.2)`   |
| `--vpick-disabled-opacity`   | `0.5`                      |
| `--vpick-height-default`     | `2rem`                     |
| `--vpick-height-sm`          | `1.75rem`                  |
| `--vpick-shadow`             | `0 0 0 0 transparent`      |

#### VPickNative

| Variable               | Default       |
| ---------------------- | ------------- |
| `--vpick-native-width` | `fit-content` |

#### VPick

| Variable                        | Default                                                                |
| ------------------------------- | ---------------------------------------------------------------------- |
| `--vpick-option-radius`         | `0.5rem`                                                               |
| `--vpick-listbox-bg`            | `#fff`                                                                 |
| `--vpick-listbox-shadow`        | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` |
| `--vpick-listbox-ring`          | `rgba(0, 0, 0, 0.06)`                                                  |
| `--vpick-listbox-max-height`    | `16rem`                                                                |
| `--vpick-listbox-z-index`       | `50`                                                                   |
| `--vpick-option-hover-bg`       | `#f5f5f5`                                                              |
| `--vpick-option-highlight-bg`   | `#f5f5f5`                                                              |
| `--vpick-option-selected-color` | `inherit`                                                              |
| `--vpick-option-check-color`    | `currentColor`                                                         |
| `--vpick-group-label-color`     | `#737373`                                                              |
| `--vpick-group-label-size`      | `0.75rem`                                                              |

You can override variables at different scopes:

```css
/* Global: in your main CSS file */
:root {
  --vpick-border-radius: 0;
  --vpick-border-color: #d1d5db;
}
```

```vue
<!-- Scoped: affects only instances inside this container -->
<style scoped>
.my-container {
  --vpick-border-radius: 0px;
  --vpick-bg: #f9fafb;
}
</style>

<template>
  <div class="my-container">
    <VPickNative :options="options" />
  </div>
</template>
```

```vue
<!-- Inline: single instance -->
<VPickNative
  :options="options"
  style="--vpick-border-radius: 9999px; --vpick-border-color: #6366f1;"
/>
```

## License

MIT
