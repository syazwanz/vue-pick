---
title: Floating UI
description: Position the VPick dropdown with Floating UI. Pass the library and VPick uses it for placement, keeping its own timing, alignment and gap.
---

<script setup>
import FloatingUiExample from '../examples/positioning-engines/floating-ui.vue'
import FloatingUiCode from '../examples/positioning-engines/floating-ui.vue?raw'
</script>

# Floating UI

This guide switches VPick's dropdown positioning to
[Floating UI](https://floating-ui.com). Use it when the rest of your app already
positions its popovers, menus and tooltips with Floating UI, and you want
dropdowns to follow the same rules.

## Demo

Open both. The second lines up with the trigger's end edge.

<Preview :code="FloatingUiCode">
  <FloatingUiExample />
</Preview>

## Approach

- You pass the Floating UI library as a prop. There is no function to write.
- VPick calls Floating UI's `computePosition` with `offset`, `flip` and `shift`,
  and applies the position it returns.
- VPick still decides when to reposition: on open, on scroll, on resize, and when
  the list changes size.
- Floating UI is not bundled into VPick. VPick uses the copy you pass.

## Anatomy

```vue
<script setup>
import * as FloatingUI from "@floating-ui/dom"
</script>

<template>
  <VPick :options="options" :floating-ui="FloatingUI" />
</template>
```

## Setup

### Install

```bash
npm install @floating-ui/dom
```

### Pass the library

Import the whole library once and pass it to each VPick that should use it:

```js
import * as FloatingUI from "@floating-ui/dom"
```

```vue
<VPick :options="options" :floating-ui="FloatingUI" />
```

## What carries over

- **`align`** becomes the placement, lining up with the trigger's start or end
  edge. It follows the trigger's writing direction, the same as the built-in
  positioning.
- **`--vpick-listbox-offset`** becomes the `offset` middleware.
- **Staying on screen** is Floating UI's `flip`, which opens the dropdown above
  when there is more room there, and `shift`, which keeps it 8px inside the
  visible edges.

## What changes

While `floatingUi` is set, VPick's own positioning is off, and with it:

- **Anchoring inside scroll containers.** `strategy` has no effect. Floating UI
  places the dropdown in the page and follows the trigger as things scroll.
- **`hideWhenDetached`.** The dropdown is no longer hidden when its trigger
  scrolls out of view.

Everything else is unchanged: keyboard support, search, selection, scroll lock,
theming, and `teleportTo`.

## When not to use it

VPick's built-in positioning needs no setup and handles dropdowns inside scroll
containers and modals. If Floating UI is not already part of your app, adding it
only for dropdowns buys little.
