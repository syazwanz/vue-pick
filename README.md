# Vue Pick

![npm downloads](https://img.shields.io/npm/dm/vue-pick) ![GitHub stars](https://img.shields.io/github/stars/syazwanz/vue-pick)

Accessible Vue select/combobox component for Vue 2.7 and Vue 3.

- Zero dependencies (only Vue as peer)
- Native `<select>` wrapper and custom dropdown, both fully accessible
- Option groups with labels and separators
- Loading / error / disabled states
- Customizable via CSS custom properties and slots
- ~4KB minified (ESM)

### Components

| Component     | Status             | Description                                                              |
| ------------- | ------------------ | ------------------------------------------------------------------------ |
| `VPickNative` | Available          | Native `<select>` wrapper with styling, slots, and accessibility         |
| `VPick`       | Available (Vue 3)  | Custom dropdown with keyboard navigation, group labels, and separators   |

> **Note:** `VPick` is Vue 3 only in the current release. A Vue 2 port is coming in the next version. `VPickNative` is available for both Vue 2.7 and Vue 3.

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

## VPick (custom dropdown)

`VPick` is a custom-rendered dropdown with full keyboard navigation, group labels, separators, and a visually hidden native `<select>` for form submission and HTML validation. It accepts the same `options` shape as `VPickNative`.

```vue
<script setup>
import { ref } from "vue"
import { VPick } from "vue-pick"
import "vue-pick/style.css"

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

### Form submission & validation

When `VPick` is rendered inside a `<form>`, it transparently renders a visually hidden `<select>` that carries the `name`, `required`, and `disabled` props, so native form submission and `:required` validation work out of the box.

```vue
<form @submit.prevent="onSubmit">
  <VPick v-model="status" name="status" :options="options" required />
  <button type="submit">Save</button>
</form>
```

Value changes also dispatch a bubbling `change` event on the hidden select, so parent `<form @change>` handlers fire as expected.

## Option Groups

Groups are detected automatically when an item has an `options` array. Both `VPickNative` (via `<optgroup>`) and `VPick` (via a styled group label row with `role="group"` + `aria-labelledby`) render them accessibly.

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

### Separators (VPick only)

Set the `separators` prop to render a horizontal divider between every adjacent group in the dropdown. No data changes required.

```vue
<VPick :options="groupedOptions" separators />
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

| Prop          | Type      | Default | Description                                                                 |
| ------------- | --------- | ------- | --------------------------------------------------------------------------- |
| `separators`  | `boolean` | `false` | Renders a horizontal divider between every adjacent group in the dropdown. |
| `rotateIcon`  | `boolean` | `false` | Rotates the trigger chevron 180° when the dropdown is open.                |

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

**Shared (both `VPickNative` and `VPick`)**

| Variable                     | Default                      |
| ---------------------------- | ---------------------------- |
| `--vpick-font-family`        | `inherit`                    |
| `--vpick-font-size`          | `0.875rem`                   |
| `--vpick-line-height`        | `1.25rem`                    |
| `--vpick-width`              | `fit-content`                |
| `--vpick-border-color`       | `#e5e5e5`                    |
| `--vpick-border-radius`      | `0.625rem`                   |
| `--vpick-bg`                 | `transparent`                |
| `--vpick-text-color`         | `inherit`                    |
| `--vpick-placeholder-color`  | `#737373`                    |
| `--vpick-icon-color`         | `#737373`                    |
| `--vpick-focus-border-color` | `#a1a1a1`                    |
| `--vpick-focus-ring-color`   | `rgba(161, 161, 161, 0.5)`   |
| `--vpick-error-border-color` | `#dc2626`                    |
| `--vpick-error-bg`           | `rgba(220, 38, 38, 0.05)`    |
| `--vpick-error-ring-color`   | `rgba(220, 38, 38, 0.2)`     |
| `--vpick-disabled-opacity`   | `0.5`                        |
| `--vpick-height-default`     | `2rem`                       |
| `--vpick-height-sm`          | `1.75rem`                    |
| `--vpick-shadow`             | `0 0 0 0 transparent`        |

**VPickNative**

| Variable              | Default       |
| --------------------- | ------------- |
| `--vpick-native-width`| `fit-content` |

**VPick (custom dropdown)**

| Variable                      | Default                                                              |
| ----------------------------- | -------------------------------------------------------------------- |
| `--vpick-option-radius`       | `0.5rem`                                                             |
| `--vpick-listbox-bg`          | `#fff`                                                               |
| `--vpick-listbox-shadow`      | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` |
| `--vpick-listbox-ring`        | `rgba(0, 0, 0, 0.06)`                                                |
| `--vpick-listbox-max-height`  | `16rem`                                                              |
| `--vpick-listbox-z-index`     | `50`                                                                 |
| `--vpick-option-hover-bg`     | `#f5f5f5`                                                            |
| `--vpick-option-highlight-bg` | `#f5f5f5`                                                            |
| `--vpick-option-selected-color` | `inherit`                                                          |
| `--vpick-option-check-color` | `currentColor`                                                        |
| `--vpick-group-label-color`  | `#737373`                                                             |
| `--vpick-group-label-size`   | `0.75rem`                                                             |

You can override variables at different scopes:

```css
/* Global — in your main CSS file */
:root {
  --vpick-border-radius: 0;
  --vpick-border-color: #d1d5db;
}
```

```vue
<!-- Scoped — affects only instances inside this container -->
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
<!-- Inline — single instance -->
<VPickNative
  :options="options"
  style="--vpick-border-radius: 9999px; --vpick-border-color: #6366f1;"
/>
```

## License

MIT
