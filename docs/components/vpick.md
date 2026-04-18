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
import SizesExample from '../examples/vpick/sizes.vue'
import SizesCode from '../examples/vpick/sizes.vue?raw'
import RotateIconExample from '../examples/vpick/rotate-icon.vue'
import RotateIconCode from '../examples/vpick/rotate-icon.vue?raw'
import CustomKeysExample from '../examples/vpick/custom-keys.vue'
import CustomKeysCode from '../examples/vpick/custom-keys.vue?raw'
</script>

# VPick

A custom dropdown triggered by a button, with full keyboard navigation and group labels.

## Usage

<Preview :code="BasicCode">
  <BasicExample />
</Preview>

## Options

Accepts the same `options` shape as `VPickNative` -- flat arrays and grouped arrays both work.

## Examples

### Grouped

<Preview :code="GroupedCode">
  <GroupedExample />
</Preview>

### Separators

Use `separators` to render a horizontal divider between adjacent groups. Combine with `rotate-icon` to rotate the chevron when the dropdown is open.

<Preview :code="SeparatorsCode">
  <SeparatorsExample />
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

### Rotate icon

<Preview :code="RotateIconCode">
  <RotateIconExample />
</Preview>

### Custom data shape

Use `labelKey`, `valueKey`, `disabledKey`, and `groupOptionsKey` to pass data straight from your API without mapping. See the [Data Shape guide](/guide/data-shape) for the full reference.

<Preview :code="CustomKeysCode">
  <CustomKeysExample />
</Preview>

## Props

These props apply to both `VPickNative` and `VPick`:

| Prop              | Type                | Default      | Description                                              |
| ----------------- | ------------------- | ------------ | -------------------------------------------------------- |
| `modelValue`      | `any`               | `undefined`  | Selected value. Use `v-model` for two-way binding.       |
| `options`         | `OptionOrGroup[]`   | **required** | Array of options or option groups.                       |
| `placeholder`     | `string`            | `undefined`  | Placeholder text shown when no value is selected.        |
| `disabled`        | `boolean`           | `false`      | Disables the select.                                     |
| `loading`         | `boolean`           | `false`      | Shows a spinner and disables interaction.                |
| `error`           | `string`            | `undefined`  | Error message. Applies error styling and `aria-invalid`. |
| `size`            | `"default" \| "sm"` | `"default"`  | Size variant.                                            |
| `id`              | `string`            | `undefined`  | HTML `id` attribute.                                     |
| `name`            | `string`            | `undefined`  | HTML `name` attribute for form submission.               |
| `required`        | `boolean`           | `false`      | HTML `required` attribute.                               |
| `ariaLabel`       | `string`            | `undefined`  | `aria-label` for accessibility.                          |
| `ariaDescribedby` | `string`            | `undefined`  | `aria-describedby` for accessibility.                    |
| `labelKey`        | `string`            | `"label"`    | Object key to read each option's visible label from.     |
| `valueKey`        | `string`            | `"value"`    | Object key to read each option's value from.             |
| `disabledKey`     | `string`            | `"disabled"` | Object key to read each option's disabled flag from.     |
| `groupOptionsKey` | `string`            | `"options"`  | Object key for the options array inside a group.         |

### VPick-only props

| Prop          | Type      | Default      | Description                                                           |
| ------------- | --------- | ------------ | --------------------------------------------------------------------- |
| `separators`  | `boolean` | `false`      | Renders a horizontal divider between adjacent groups in the dropdown. |
| `rotateIcon`  | `boolean` | `false`      | Rotates the trigger chevron 180 degrees when the dropdown is open.    |
| `childrenKey` | `string`  | `"children"` | Object key for nested children (reserved for future tree support).    |

## Slots

| Slot      | Description                                             |
| --------- | ------------------------------------------------------- |
| `icon`    | Custom chevron icon. Shown when not loading.            |
| `loading` | Custom loading indicator. Shown when `loading` is true. |

## Keyboard navigation

| Key                       | Action                                |
| ------------------------- | ------------------------------------- |
| `Enter` / `Space`         | Open dropdown / select focused option |
| `Escape`                  | Close dropdown                        |
| `Arrow Up` / `Arrow Down` | Move focus between options            |
| `Home`                    | Focus first option                    |
| `End`                     | Focus last option                     |
| `Tab`                     | Close dropdown and move focus         |

## Accessibility

- WAI-ARIA listbox pattern (`role="combobox"`, `role="listbox"`, `role="option"`).
- `aria-expanded` reflects open state on the trigger button.
- `aria-activedescendant` tracks the focused option.
- `aria-invalid` is set when the `error` prop is present.
- `aria-disabled` on individual disabled options.
- A visually hidden native `<select>` is kept in sync for form submission and Safari autofill.
