# vue-pick

Accessible Vue select/combobox component for Vue 2.7 and Vue 3.

- Zero dependencies (only Vue as peer)
- Native `<select>` wrapper with full accessibility
- Option groups, loading/error/disabled/readonly states
- Customizable via CSS custom properties and slots
- ~4KB minified (ESM)

## Install

```bash
npm install vue-pick
# or
pnpm add vue-pick
```

## Usage

### Vue 3

```vue
<script setup>
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
  <VPickNative v-model="selected" :options="options" placeholder="Select status..." />
</template>
```

### Vue 2.7

```vue
<script setup>
import { VPickNative } from "vue-pick/vue2"
import "vue-pick/style.css"

const selected = ref(null)

const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <VPickNative v-model="selected" :options="options" placeholder="Select status..." />
</template>
```

The only difference is the import path. Everything else is identical.

## Option Groups

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

Groups are detected automatically when an item has an `options` array.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` / `value` | `any` | `undefined` | Selected value. Use `v-model` for two-way binding. |
| `options` | `OptionOrGroup[]` | **required** | Array of options or option groups. |
| `placeholder` | `string` | `undefined` | Placeholder text shown as a disabled first option. |
| `disabled` | `boolean` | `false` | Disables the select. |
| `readonly` | `boolean` | `false` | Prevents value changes while keeping form submission. |
| `loading` | `boolean` | `false` | Shows a spinner and disables the select. |
| `error` | `string` | `undefined` | Error message. Applies error styling and `aria-invalid`. |
| `size` | `"default" \| "sm"` | `"default"` | Size variant. |
| `id` | `string` | `undefined` | HTML `id` attribute. |
| `name` | `string` | `undefined` | HTML `name` attribute for form submission. |
| `required` | `boolean` | `false` | HTML `required` attribute. |
| `ariaLabel` | `string` | `undefined` | `aria-label` for accessibility. |
| `ariaDescribedby` | `string` | `undefined` | `aria-describedby` for accessibility. |

> Vue 3 uses `modelValue` + `update:modelValue`. Vue 2 uses `value` + `input`. Both work transparently with `v-model`.

## Slots

| Slot | Description |
|------|-------------|
| `icon` | Custom chevron icon. Shown when not loading. |
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

## Theming

Override CSS custom properties to customize the appearance:

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

You can also scope variables to a single instance:

```vue
<VPickNative
  :options="options"
  style="--vpick-border-radius: 9999px; --vpick-border-color: #6366f1;"
/>
```

## License

MIT
