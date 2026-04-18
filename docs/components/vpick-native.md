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

## Usage

<Preview :code="BasicCode">
  <BasicExample />
</Preview>

::: tip Vue 2.7
Same code works in Vue 2.7. Just change the import to `import { VPickNative } from "vue-pick/vue2"`.
:::

## Options

The `options` prop accepts a flat array or a nested array with groups. Groups are detected automatically when an item has an `options` array.

## Examples

### Grouped

<Preview :code="GroupedCode">
  <GroupedExample />
</Preview>

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

### Sizes

<Preview :code="SizesCode">
  <SizesExample />
</Preview>

### Custom data shape

Use `labelKey`, `valueKey`, `disabledKey`, and `groupOptionsKey` to pass data straight from your API without mapping. See the [Data Shape guide](/guide/data-shape) for the full reference.

<Preview :code="CustomKeysCode">
  <CustomKeysExample />
</Preview>

## Props

| Prop                   | Type                | Default      | Description                                              |
| ---------------------- | ------------------- | ------------ | -------------------------------------------------------- |
| `modelValue` / `value` | `any`               | `undefined`  | Selected value. Use `v-model` for two-way binding.       |
| `options`              | `OptionOrGroup[]`   | **required** | Array of options or option groups.                       |
| `placeholder`          | `string`            | `undefined`  | Placeholder text shown when no value is selected.        |
| `disabled`             | `boolean`           | `false`      | Disables the select.                                     |
| `loading`              | `boolean`           | `false`      | Shows a spinner and disables interaction.                |
| `error`                | `string`            | `undefined`  | Error message. Applies error styling and `aria-invalid`. |
| `size`                 | `"default" \| "sm"` | `"default"`  | Size variant.                                            |
| `id`                   | `string`            | `undefined`  | HTML `id` attribute.                                     |
| `name`                 | `string`            | `undefined`  | HTML `name` attribute for form submission.               |
| `required`             | `boolean`           | `false`      | HTML `required` attribute.                               |
| `ariaLabel`            | `string`            | `undefined`  | `aria-label` for accessibility.                          |
| `ariaDescribedby`      | `string`            | `undefined`  | `aria-describedby` for accessibility.                    |
| `labelKey`             | `string`            | `"label"`    | Object key to read each option's visible label from.     |
| `valueKey`             | `string`            | `"value"`    | Object key to read each option's value from.             |
| `disabledKey`          | `string`            | `"disabled"` | Object key to read each option's disabled flag from.     |
| `groupOptionsKey`      | `string`            | `"options"`  | Object key for the options array inside a group.         |

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

## Accessibility

- Uses a real native `<select>` element for full browser and screen reader support.
- `aria-invalid` is set when the `error` prop is present.
- `aria-busy` is set when `loading` is true.
- `aria-describedby` wired via the `ariaDescribedby` prop.
- Disabled state uses native `disabled` attribute (not pointer-events).
