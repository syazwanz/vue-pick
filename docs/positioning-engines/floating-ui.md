---
title: Floating UI
description: Position the VPick dropdown with Floating UI. Pass the library and Floating UI places the dropdown, keeps it in place and hides it, the same as your other popovers.
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
- Floating UI does the positioning: `computePosition` with `offset`, `flip`,
  `shift` and `hide` works out where the dropdown goes, and `autoUpdate` keeps
  it there.
- VPick renders the dropdown into the container it belongs to, such as a scroll
  container or a modal, which Floating UI does not do.
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

VPick works with `@floating-ui/dom` 1.4 or newer.

### Pass the library

Import the whole library once and pass it to each VPick that should use it:

```js
import * as FloatingUI from "@floating-ui/dom"
```

```vue
<VPick :options="options" :floating-ui="FloatingUI" />
```

## What Floating UI does

- **Placement.** `align` becomes the placement, lining up with the trigger's
  start or end edge and following the trigger's writing direction.
  `--vpick-listbox-offset` becomes the `offset` middleware.
- **Staying on screen.** `flip` opens the dropdown above when there is more room
  there, and `shift` keeps it 8px inside the visible edges. When a dropdown is
  too wide for the room beside its trigger, `flip` lines it up with the
  trigger's other edge instead.
- **Staying in place.** `autoUpdate` repositions the dropdown on scroll and
  resize, when the trigger or the dropdown changes size, and when the trigger
  moves on its own, such as when a message appears above it.
- **Hiding.** With `hideWhenDetached` on, `hide` hides the dropdown while its
  trigger is cut off by any container around it, including one with
  `overflow: hidden`.

## What VPick still does

- **`strategy` and `teleportTo`** decide where the dropdown is rendered, so
  inside a scrolling modal it stays in the modal, above the modal's backdrop.
- Keyboard support, search, selection, scroll lock and theming are unchanged.

## When not to use it

VPick's built-in positioning needs no setup and handles dropdowns inside scroll
containers and modals. Reach for Floating UI when it already positions the rest
of your app, or when a dropdown needs to follow content that moves while it is
open.
