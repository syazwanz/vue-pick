---
title: Data Shape
description: Use your existing data shape directly. VPick and VPickNative accept labelKey, valueKey, disabledKey, childrenKey, and groupOptionsKey to adapt to any object shape without transforming your data.
---

<script setup>
import CustomKeysExample from '../examples/vpick/custom-keys.vue'
import CustomKeysCode from '../examples/vpick/custom-keys.vue?raw'
import CustomKeysNativeExample from '../examples/vpick-native/custom-keys.vue'
import CustomKeysNativeCode from '../examples/vpick-native/custom-keys.vue?raw'
</script>

# Data Shape

By default, Vue Pick expects options in a `{ label, value }` shape. If your data comes from an API with different field names (for example `{ id, name }`), you have two options: transform it with `.map()`, or tell Vue Pick which keys to use.

## Default shape

```ts
interface OptionItem {
  label: string
  value: any
  disabled?: boolean
  children?: OptionItem[]
}

interface OptionGroup {
  label: string
  disabled?: boolean
  options: OptionItem[]
}
```

## Adapter props

Rather than forcing you to map your data, VPick and VPickNative accept key adapter props:

| Prop              | Default      | Applies to | Description                                                                          |
| ----------------- | ------------ | ---------- | ------------------------------------------------------------------------------------ |
| `labelKey`        | `"label"`    | Both       | Key for the visible option text.                                                     |
| `valueKey`        | `"value"`    | Both       | Key for the emitted `v-model` value.                                                 |
| `disabledKey`     | `"disabled"` | Both       | Key for the per-option disabled flag.                                                |
| `childrenKey`     | `"children"` | VPick only | Key for nested children. Options with a non-empty `children` array enable tree mode. |
| `groupOptionsKey` | `"options"`  | Both       | Key for the array of options inside a group.                                         |

All defaults match the base shape, so existing code keeps working with no changes.

## Using custom keys

Your API returns users as `{ id, name, inactive }`? Point Vue Pick at those keys directly. No `.map()` required.

<Preview :code="CustomKeysCode">
  <CustomKeysExample />
</Preview>

The same props work on `VPickNative`:

<Preview :code="CustomKeysNativeCode">
  <CustomKeysNativeExample />
</Preview>

## Groups with custom keys

Groups are detected whenever an item has an array at its `groupOptionsKey`. Both the group label and its nested options respect `labelKey` and `valueKey`.

```vue
<script setup>
const regions = [
  {
    name: "Americas",
    members: [
      { id: "us", name: "United States" },
      { id: "ca", name: "Canada" },
    ],
  },
]
</script>

<template>
  <VPick
    :options="regions"
    value-key="id"
    label-key="name"
    group-options-key="members"
  />
</template>
```

## Tree data

Options with a non-empty `children` array automatically enable tree mode in `VPick`. No extra prop is needed — the component detects nested data and renders expand/collapse chevrons.

```ts
const categories = [
  {
    label: "Electronics",
    value: "electronics",
    children: [
      { label: "Phones", value: "phones" },
      {
        label: "Laptops",
        value: "laptops",
        children: [
          { label: "Gaming", value: "gaming" },
          { label: "Business", value: "business" },
        ],
      },
    ],
  },
  { label: "Books", value: "books" }, // flat items can coexist
]
```

Flat groups (`{ label, options: [] }`) and tree nodes (`{ label, value, children: [] }`) can be mixed at the top level. Empty `children: []` is treated as a leaf — no chevron is rendered.

Use `childrenKey` if your API uses a different key name:

```vue
<VPick :options="data" children-key="subcategories" />
```

## Anything beyond key renaming

Vue Pick does not ship function-based adapter props like `reduce`, `normalizer`, or `getOptionLabel`. If you need computed labels or derived values, transform your data in a `computed` first:

```vue
<script setup>
import { computed } from "vue"

const users = ref([...])

const options = computed(() =>
  users.value.map((u) => ({
    label: `${u.firstName} ${u.lastName}`,
    value: u.id,
  }))
)
</script>

<template>
  <VPick :options="options" />
</template>
```

One line in a `computed` handles any shape Vue Pick's key props cannot.
