# Vue Pick

[![NPM Version](https://img.shields.io/npm/v/vue-pick)](https://www.npmjs.com/package/vue-pick) [![npm downloads](https://img.shields.io/npm/dm/vue-pick)](https://www.npmjs.com/package/vue-pick) [![GitHub stars](https://img.shields.io/github/stars/syazwanz/vue-pick)](https://github.com/syazwanz/vue-pick)

Accessible select components for Vue 2.7 and Vue 3.

- Zero dependencies
- Native `<select>` wrapper and custom dropdown
- Same API across Vue 2.7 and Vue 3
- CSS custom properties for theming
- Full keyboard navigation and ARIA support

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

For Vue 2.7, change the import path to `vue-pick/vue2`.

## Documentation

Full docs, live examples, and API reference at **[vue-pick.js.org](https://vue-pick.js.org)**.

## License

MIT
