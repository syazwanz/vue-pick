---
title: VPick
description: A fully accessible custom dropdown for Vue 2.7 and Vue 3 with keyboard navigation, group labels, slots, and ARIA support.
---

<script setup>
import BasicExample from '../examples/vpick/basic.vue'
import BasicCode from '../examples/vpick/basic.vue?raw'
import GroupedExample from '../examples/vpick/grouped.vue'
import GroupedCode from '../examples/vpick/grouped.vue?raw'
import SeparatorsExample from '../examples/vpick/separators.vue'
import SeparatorsCode from '../examples/vpick/separators.vue?raw'
import DisabledExample from '../examples/vpick/disabled.vue'
import DisabledCode from '../examples/vpick/disabled.vue?raw'
import LoadingExample from '../examples/vpick/loading.vue'
import LoadingCode from '../examples/vpick/loading.vue?raw'
import ErrorExample from '../examples/vpick/error.vue'
import ErrorCode from '../examples/vpick/error.vue?raw'
import ScrollableExample from '../examples/vpick/scrollable.vue'
import ScrollableCode from '../examples/vpick/scrollable.vue?raw'
import RotateIconExample from '../examples/vpick/rotate-icon.vue'
import RotateIconCode from '../examples/vpick/rotate-icon.vue?raw'
import CustomKeysExample from '../examples/vpick/custom-keys.vue'
import CustomKeysCode from '../examples/vpick/custom-keys.vue?raw'
import ValueFormatExample from '../examples/vpick/value-format.vue'
import ValueFormatCode from '../examples/vpick/value-format.vue?raw'
</script>

# VPick

A custom dropdown triggered by a button, with full keyboard navigation and group labels.

<Preview :code="BasicCode">
  <BasicExample />
</Preview>

This page covers the parts every VPick has. Each of the bigger capabilities has
its own page:

| Page                                             | What it covers                                          |
| ------------------------------------------------ | ------------------------------------------------------- |
| [Search](/components/vpick/search)               | Type-ahead filtering, clearing, empty states            |
| [Multiselect](/components/vpick/multiselect)     | Multiple values, chips, `select` and `deselect`         |
| [Tree Select](/components/vpick/tree-select)     | Nested options, cascade selection, searching a tree     |
| [Slots](/components/vpick/slots)                 | Replacing labels, icons, and the empty state            |
| [Positioning](/components/vpick/positioning)     | Where the panel renders, scroll containers, inline mode |
| [Forms](/components/vpick/forms)                 | Labelling, submission, validation                       |
| [Accessibility](/components/vpick/accessibility) | Keyboard navigation, ARIA roles, screen readers         |
| [API](/components/vpick/api)                     | Every prop, slot, event, and method in one place        |

## Options

Accepts the same `options` shape as `VPickNative`. Flat arrays and grouped
arrays both work, and groups are detected automatically when an item has an
`options` array.

### Grouped

<Preview :code="GroupedCode">
  <GroupedExample />
</Preview>

### Separators

Use `separators` to render a horizontal divider between adjacent groups.

<Preview :code="SeparatorsCode">
  <SeparatorsExample />
</Preview>

### Custom data shape

Use `labelKey`, `valueKey`, `disabledKey`, and `groupOptionsKey` to pass data
straight from your API without mapping. See the
[Data Shape guide](/guide/data-shape) for the full reference.

`labelKey` also accepts an array, used as a fallback chain where the first key
with a non-empty value wins. Useful when records are inconsistent:

```vue
<VPick :options="options" :label-key="['label', 'name']" value-key="id" />
```

<Preview :code="CustomKeysCode">
  <CustomKeysExample />
</Preview>

## States

### Disabled

<Preview :code="DisabledCode">
  <DisabledExample />
</Preview>

### Loading

<Preview :code="LoadingCode">
  <LoadingExample />
</Preview>

### Error

<Preview :code="ErrorCode">
  <ErrorExample />
</Preview>

## Appearance

### Rotate icon

Rotates the chevron 180 degrees when the dropdown is open.

<Preview :code="RotateIconCode">
  <RotateIconExample />
</Preview>

### Scrollable

Long option lists scroll inside the dropdown. Max height is controlled by
`--vpick-listbox-max-height` (default `16rem`).

<Preview :code="ScrollableCode">
  <ScrollableExample />
</Preview>

## Sizing

By default, the trigger hugs its content (`--vpick-width: fit-content`) and the
dropdown matches the trigger width at minimum. Give the trigger an explicit
width and the dropdown will follow.

```vue
<VPick v-model="selected" :options="options" style="--vpick-width: 18rem" />
```

Options wider than the trigger make the dropdown grow. To pin both widths
identical and truncate long labels, also cap the listbox:

```vue
<VPick
  v-model="selected"
  :options="options"
  style="
    --vpick-width: 18rem;
    --vpick-listbox-max-width: var(--vpick-trigger-width);
  "
/>
```

| Variable                     | Default                 | Effect                                    |
| ---------------------------- | ----------------------- | ----------------------------------------- |
| `--vpick-width`              | `fit-content`           | Trigger width.                            |
| `--vpick-listbox-min-width`  | `--vpick-trigger-width` | Minimum dropdown width.                   |
| `--vpick-listbox-max-width`  | `calc(100vw - 16px)`    | Maximum dropdown width.                   |
| `--vpick-listbox-max-height` | `16rem`                 | Maximum dropdown height before scrolling. |

`--vpick-trigger-width` is measured and set by Vue Pick on every open, so read
it rather than assign it.

## Object values

By default `v-model` holds plain values:

```js
selected = ["apple", "banana"]
```

Set `valueFormat="object"` and it holds your original option objects instead:

```js
selected = [
  { id: "apple", label: "Apple", price: 3 },
  { id: "banana", label: "Banana", price: 2 },
]
```

Useful when you need other fields off the selection and would otherwise look
them up yourself. Both controls below hold the same selection:

<Preview :code="ValueFormatCode">
  <ValueFormatExample />
</Preview>

```vue
<VPick
  v-model="selected"
  :options="fruit"
  label-key="label"
  value-key="id"
  value-format="object"
/>
```

Objects you pass back in are matched by `valueKey`, not by identity, so a
rebuilt object literal still resolves:

```js
selected = { id: "apple" } // matches the Apple option
```

The hidden `<select>` used for form submission always posts plain values, since
a form field cannot carry an object.

## Core props

The props every VPick takes. The rest are listed on the page for the feature
they belong to, and all of them together on the [API Reference](/components/vpick/api).

<PropList group="core" />

### Data shape

<PropList group="keys" />

### Appearance

<PropList group="appearance" />
