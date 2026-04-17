---
title: Installation
description: Install Vue Pick via npm, pnpm, or yarn. Import the stylesheet and register the component in Vue 2.7 or Vue 3 projects.
---

# Installation

## Install the package

::: code-group

```sh [npm]
npm install vue-pick
```

```sh [pnpm]
pnpm add vue-pick
```

```sh [yarn]
yarn add vue-pick
```

:::

## Import the stylesheet

Import the base CSS once in your app entry. The component will not render correctly without it.

::: code-group

```ts [main.ts (Vue 3)]
import { createApp } from "vue"
import App from "./App.vue"
import "vue-pick/style.css"

createApp(App).mount("#app")
```

```ts [main.ts (Vue 2)]
import Vue from "vue"
import App from "./App.vue"
import "vue-pick/style.css"

new Vue({ render: (h) => h(App) }).$mount("#app")
```

:::

## Vue 2.7 vs Vue 3 imports

Both components are available from separate entry points. The API is identical — only the import path changes.

```ts
// Vue 3
import { VPickNative, VPick } from "vue-pick"

// Vue 2.7
import { VPickNative, VPick } from "vue-pick/vue2"
```

## Other CSS import strategies

You can also import the stylesheet from a central CSS file or directly inside a component:

```css
/* main.css */
@import "vue-pick/style.css";
```

```vue
<!-- SomeComponent.vue -->
<script setup>
import { VPickNative } from "vue-pick"
import "vue-pick/style.css"
</script>
```
