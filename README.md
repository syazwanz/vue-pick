# vue-pick

Accessible Vue select/combobox component for Vue 2.7 and Vue 3.

- Zero dependencies (only Vue as peer)
- Native `<select>` wrapper with full accessibility
- Option groups, loading/error/disabled states
- Customizable via CSS custom properties and slots
- ~4KB minified (ESM)

### Components

| Component     | Status    | Description                                                                         |
| ------------- | --------- | ----------------------------------------------------------------------------------- |
| `VPickNative` | Available | Native `<select>` wrapper with styling, slots, and accessibility                    |
| `VPick`       | Planned   | Custom dropdown with search, keyboard navigation, tree select, and custom rendering |

## Install

```bash
npm install vue-pick
# or
pnpm add vue-pick
```

## Usage

### Composition API (Vue 3)

```vue
<script setup>
import { ref } from "vue"
import { VPickNative } from "vue-pick"
import "vue-pick/style.css"

const selected = ref(null)

const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <VPickNative
    v-model="selected"
    :options="options"
    placeholder="Select status"
  />
</template>
```

### Composition API (Vue 2.7)

The code is identical to Vue 3, but you must change the component import path.

```js
import { VPickNative } from "vue-pick/vue2"
```

### Options API (Vue 2 & Vue 3)

```vue
<script>
import { VPickNative } from "vue-pick" // Change to "vue-pick/vue2" for Vue 2
import "vue-pick/style.css"

export default {
  components: {
    VPickNative,
  },
  data() {
    return {
      selected: null,
      options: [
        { label: "Todo", value: "todo" },
        { label: "In Progress", value: "in-progress" },
        { label: "Done", value: "done" },
      ],
    }
  },
}
</script>

<template>
  <VPickNative
    v-model="selected"
    :options="options"
    placeholder="Select status"
  />
</template>
```

## Option Groups

Groups are detected automatically when an item has an `options` array.

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

| Prop                   | Type                | Default      | Description                                              |
| ---------------------- | ------------------- | ------------ | -------------------------------------------------------- |
| `modelValue` / `value` | `any`               | `undefined`  | Selected value. Use `v-model` for two-way binding.       |
| `options`              | `OptionOrGroup[]`   | **required** | Array of options or option groups.                       |
| `placeholder`          | `string`            | `undefined`  | Placeholder text shown as a disabled first option.       |
| `disabled`             | `boolean`           | `false`      | Disables the select.                                     |
| `loading`              | `boolean`           | `false`      | Shows a spinner and disables the select.                 |
| `error`                | `string`            | `undefined`  | Error message. Applies error styling and `aria-invalid`. |
| `size`                 | `"default" \| "sm"` | `"default"`  | Size variant.                                            |
| `id`                   | `string`            | `undefined`  | HTML `id` attribute.                                     |
| `name`                 | `string`            | `undefined`  | HTML `name` attribute for form submission.               |
| `required`             | `boolean`           | `false`      | HTML `required` attribute.                               |
| `ariaLabel`            | `string`            | `undefined`  | `aria-label` for accessibility.                          |
| `ariaDescribedby`      | `string`            | `undefined`  | `aria-describedby` for accessibility.                    |

> Vue 3 uses `modelValue` + `update:modelValue`. Vue 2 uses `value` + `input`. Both work transparently with `v-model`.

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

## Types

```ts
interface OptionItem {
  label: string
  value: any
  disabled?: boolean
}

interface OptionGroup {
  label: string
  disabled?: boolean
  options: OptionItem[]
}

type OptionOrGroup = OptionItem | OptionGroup
```

The `isOptionGroup` helper is exported for type narrowing:

```ts
import { isOptionGroup } from "vue-pick"

if (isOptionGroup(item)) {
  // item is OptionGroup
}
```

## Theming & CSS

`vue-pick` uses CSS custom properties (variables) for all styling. You must import the default CSS for the component to render correctly.

### Importing the CSS

Choose the import method that matches your project structure:

#### Global Import (Recommended)

Import the CSS once in your main entry file (like main.js or main.ts). This is the best approach for consistency, ensuring styles are loaded before any component renders.

```ts
import { createApp } from "vue"
import App from "./App.vue"
import "vue-pick/style.css"

createApp(App).mount("#app")
```

#### Main Stylesheet Import

If you manage a central CSS file, you can import it there. This keeps all your third party style imports organized in one place.

```css
/* main.css */
@import "vue-pick/style.css";

body {
  margin: 0;
}
```

#### Component Level Import

Import the CSS inside the specific .vue file. Use this if you prefer co-locating the import with the component that uses it.

```vue
<script setup>
import { VPickNative } from "vue-pick"
import "vue-pick/style.css"
</script>
```

### CSS Variables Reference

These are the default variables you can override in your app.

```css
:root {
  --vpick-font-family: inherit;
  --vpick-font-size: 0.875rem;
  --vpick-line-height: 1.25rem;
  --vpick-border-color: #e5e5e5;
  --vpick-border-radius: 0.375rem;
  --vpick-bg: transparent;
  --vpick-text-color: inherit;
  --vpick-placeholder-color: #a3a3a3;
  --vpick-icon-color: rgb(24, 24, 24);
  --vpick-focus-border-color: #b4b4b4;
  --vpick-focus-ring-color: rgba(180, 180, 180, 0.5);
  --vpick-error-border-color: #dc2626;
  --vpick-error-bg: rgba(220, 38, 38, 0.05);
  --vpick-error-ring-color: rgba(220, 38, 38, 0.2);
  --vpick-disabled-opacity: 0.5;
  --vpick-height-default: 2.25rem;
  --vpick-height-sm: 2rem;
  --vpick-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
```

### Customizing the Theme

You can override the default appearance by modifying the CSS variables.

**Global Override:** Add this to your main CSS file to change the appearance app-wide

```css
:root {
  --vpick-border-radius: 0.375rem;
  --vpick-border-color: #e5e5e5;
  --vpick-focus-ring-color: rgba(180, 180, 180, 0.5);
  /* Add other variables here */
}
```

**Scoped Override:** Use `<style scoped>` in your Vue component to change the appearance without affecting other instances.

```vue
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

**Inline Override:** Apply styles directly to the component for isolated, single instance changes.

```vue
<VPickNative
  :options="options"
  style="--vpick-border-radius: 9999px; --vpick-border-color: #6366f1;"
/>
```

## License

MIT
