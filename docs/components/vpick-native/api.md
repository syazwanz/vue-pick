---
title: VPickNative API
description: Complete API reference for VPickNative. Every prop, slot, and event, with types and defaults, for Vue 2.7 and Vue 3.
---

# VPickNative API

Every prop, slot and event in one place.

## Props

<PropList component="VPickNative" />

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
  <template #loading>
    <MySpinner />
  </template>
</VPickNative>
```

The two are mutually exclusive: whichever suits the current state is the one
rendered.

## Events

| Event               | Payload | Description                                                                                                 |
| ------------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `any`   | Emitted when the selection changes. Vue 2 emits `input` instead, which is what `v-model` listens for there. |

One event, because the browser owns the interaction. `VPick` additionally emits
`search`, `select` and `deselect`, none of which have a meaning here.

## CSS custom properties

Theming is documented separately, since most variables are shared with `VPick`.
See [Theming](/guide/theming).

## Types

```ts
interface OptionItem {
  label: string
  value: any
  disabled?: boolean
  // Set by Vue Pick, not by you: the original object you passed in.
  raw?: unknown
}

interface OptionGroup {
  label: string
  disabled?: boolean
  options: OptionItem[]
}

type OptionOrGroup = OptionItem | OptionGroup
```

`children` is absent here on purpose: a native `<select>` cannot nest beyond one
level of `<optgroup>`, so tree data is [VPick's](/components/vpick/tree-select).

See the [Data Shape guide](/guide/data-shape) for reading your own shapes
without transforming them.
