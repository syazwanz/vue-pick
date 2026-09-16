---
title: VPickNative
description: A styled wrapper around the native HTML select element for Vue 2.7 and Vue 3. Native mobile UX, zero JavaScript dropdown, and full form integration.
---

<script setup>
import BasicExample from '../examples/vpick-native/basic.vue'
import BasicCode from '../examples/vpick-native/basic.vue?raw'
import GroupedExample from '../examples/vpick-native/grouped.vue'
import GroupedCode from '../examples/vpick-native/grouped.vue?raw'
import DisabledExample from '../examples/vpick-native/disabled.vue'
import DisabledCode from '../examples/vpick-native/disabled.vue?raw'
import LoadingExample from '../examples/vpick-native/loading.vue'
import LoadingCode from '../examples/vpick-native/loading.vue?raw'
import ErrorExample from '../examples/vpick-native/error.vue'
import ErrorCode from '../examples/vpick-native/error.vue?raw'
import SizesExample from '../examples/vpick-native/sizes.vue'
import SizesCode from '../examples/vpick-native/sizes.vue?raw'
import CustomKeysExample from '../examples/vpick-native/custom-keys.vue'
import CustomKeysCode from '../examples/vpick-native/custom-keys.vue?raw'
</script>

# VPickNative

A styled wrapper around the native `<select>` element. Same browser behaviour, consistent design.

<Preview :code="BasicCode">
  <BasicExample />
</Preview>

::: tip Vue 2.7
Same code works in Vue 2.7. Just change the import to `import { VPickNative } from "vue-pick/vue2"`.
:::

| Page                                                    | What it covers                           |
| ------------------------------------------------------- | ---------------------------------------- |
| [Forms](/components/vpick-native/forms)                 | Labelling, submission, validation        |
| [Accessibility](/components/vpick-native/accessibility) | Keyboard, screen readers, state          |
| [API](/components/vpick-native/api)                     | Every prop, slot, and event in one place |

## Options

The `options` prop accepts a flat array or a nested array with groups. Groups are detected automatically when an item has an `options` array.

### Grouped

<Preview :code="GroupedCode">
  <GroupedExample />
</Preview>

### Custom data shape

Use `labelKey`, `valueKey`, `disabledKey`, and `groupOptionsKey` to pass data straight from your API without mapping. See the [Data Shape guide](/guide/data-shape) for the full reference.

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

## Height

Set `--vpick-height-default` to resize the control. There is no size prop.

<Preview :code="SizesCode">
  <SizesExample />
</Preview>

Every other visual token is a CSS custom property too, and most are shared with
`VPick`. See [Theming](/guide/theming).

## Core props

The rest are on the [API Reference](/components/vpick-native/api).

<PropList component="VPickNative" group="core" />
