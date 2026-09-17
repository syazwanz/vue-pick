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
- VPick still decides where the dropdown lives and when it moves: inside the
  scroll container or modal it belongs to, repositioned on open, scroll, resize,
  and when the list changes size.
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

Only who works out the coordinates. Everything else behaves as it does without
`floatingUi`:

- **`strategy` and `teleportTo`** still decide where the dropdown lives, so inside
  a scrolling modal it stays in the modal, above the modal's backdrop.
- **`hideWhenDetached`** still hides the dropdown while its trigger is scrolled
  out of view.
- Keyboard support, search, selection, scroll lock and theming are unchanged.

## When not to use it

VPick's built-in positioning needs no setup and handles dropdowns inside scroll
containers and modals. If Floating UI is not already part of your app, adding it
only for dropdowns buys little.
