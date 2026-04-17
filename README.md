# Vue Pick

[![NPM Version](https://img.shields.io/npm/v/vue-pick)](https://www.npmjs.com/package/vue-pick) [![npm downloads](https://img.shields.io/npm/dm/vue-pick)](https://www.npmjs.com/package/vue-pick) [![GitHub stars](https://img.shields.io/github/stars/syazwanz/vue-pick)](https://github.com/syazwanz/vue-pick)

Accessible select components for Vue 2.7 and Vue 3.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/vue-pick-demo?file=src%2FApp.vue)

- Zero runtime dependencies
- Native `<select>` wrapper and custom dropdown
- Same API across Vue 2.7 and Vue 3
- CSS custom properties for theming
- Full keyboard navigation and ARIA support

## Components

| Component     | Vue 2.7 | Vue 3 | Description                                                       |
| ------------- | :-----: | :---: | ----------------------------------------------------------------- |
| `VPickNative` |   Yes   |  Yes  | Styled wrapper around the native `<select>`                       |
| `VPick`       |    -    |  Yes  | Custom dropdown with keyboard navigation (Vue 2 port coming soon) |

## Quick start

```bash
npm install vue-pick
```

```ts
import "vue-pick/style.css"
```

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
  <VPickNative
    v-model="selected"
    :options="options"
    placeholder="Select status"
  />
</template>
```

For Vue 2.7, change the import path to `vue-pick/vue2`.

## Documentation

Full docs, live examples, and API reference at **[vue-pick.js.org](https://vue-pick.js.org)**.

## License

MIT
