<p align="center">
  <img src="https://raw.githubusercontent.com/syazwanz/vue-pick/main/docs/public/icon.webp" alt="Vue Pick" width="120" height="120" />
</p>

<h1 align="center">Vue Pick</h1>

<p align="center">
  Accessible select components for <strong>Vue 2.7 and Vue 3</strong>, from one codebase.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vue-pick"><img alt="NPM Version" src="https://img.shields.io/npm/v/vue-pick" /></a>
  <a href="https://www.npmjs.com/package/vue-pick"><img alt="npm downloads" src="https://img.shields.io/npm/dm/vue-pick" /></a>
  <a href="https://stackblitz.com/edit/vue-pick-demo?file=src%2FApp.vue"><img alt="Open in StackBlitz" src="https://img.shields.io/badge/StackBlitz-Open_demo-1269D3?logo=stackblitz&logoColor=white" /></a>
</p>

<!-- TODO: add screenshot or short GIF of VPick dropdown in use -->

## Features

- Same API across Vue 2.7 and Vue 3
- Native `<select>` wrapper and custom dropdown
- Full keyboard navigation and ARIA support
- CSS custom properties for theming
- Zero runtime dependencies

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
