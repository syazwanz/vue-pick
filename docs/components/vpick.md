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
import SearchableExample from '../examples/vpick/searchable.vue'
import SearchableCode from '../examples/vpick/searchable.vue?raw'
import ClearableExample from '../examples/vpick/clearable.vue'
import ClearableCode from '../examples/vpick/clearable.vue?raw'
import MultipleExample from '../examples/vpick/multiple.vue'
import MultipleCode from '../examples/vpick/multiple.vue?raw'
import TreeExample from '../examples/vpick/tree.vue'
import TreeCode from '../examples/vpick/tree.vue?raw'
import TreeSearchableExample from '../examples/vpick/tree-searchable.vue'
import TreeSearchableCode from '../examples/vpick/tree-searchable.vue?raw'
import TreeCascadeExample from '../examples/vpick/tree-cascade.vue'
import TreeCascadeCode from '../examples/vpick/tree-cascade.vue?raw'
</script>

# VPick

A custom dropdown triggered by a button, with full keyboard navigation and group labels.

## Usage

<Preview :code="BasicCode">
  <BasicExample />
</Preview>

## Options

Accepts the same `options` shape as `VPickNative`. Flat arrays and grouped arrays both work.

## Examples

### Grouped

<Preview :code="GroupedCode">
  <GroupedExample />
</Preview>

### Separators

Use `separators` to render a horizontal divider between adjacent groups.

<Preview :code="SeparatorsCode">
  <SeparatorsExample />
</Preview>

### Rotate icon

Rotates the chevron 180 degrees when the dropdown is open.

<Preview :code="RotateIconCode">
  <RotateIconExample />
</Preview>

### Scrollable

Long option lists scroll inside the dropdown. Max height is controlled by `--vpick-listbox-max-height` (default `16rem`).

<Preview :code="ScrollableCode">
  <ScrollableExample />
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

### Custom data shape

Use `labelKey`, `valueKey`, `disabledKey`, and `groupOptionsKey` to pass data straight from your API without mapping. See the [Data Shape guide](/guide/data-shape) for the full reference.

<Preview :code="CustomKeysCode">
  <CustomKeysExample />
</Preview>

### Searchable

Use `searchable` to render an input trigger with built-in type-ahead filtering. The dropdown shows all options when opened, and filters as the user types.

<Preview :code="SearchableCode">
  <SearchableExample />
</Preview>

### Clearable

Use `clearable` to show a clear button when a value is selected. Works in both button and searchable modes.

<Preview :code="ClearableCode">
  <ClearableExample />
</Preview>

### Multiple

Use `multiple` to allow selecting more than one option. The trigger renders selected values as removable chips, and `v-model` becomes an array. Picking an option does not close the dropdown, so the user can keep selecting; pressing `Backspace` while the input is empty removes the last chip.

`multiple` always uses the searchable trigger so chips and the input share one row. Combine with `clearable` to expose a single button that empties the array.

<Preview :code="MultipleCode">
  <MultipleExample />
</Preview>

### Tree select

Pass options with a `children` array to enable tree mode. VPick detects nested data automatically — no extra prop needed. Click the chevron to expand or collapse a branch; clicking the row itself selects the node.

<Preview :code="TreeCode">
  <TreeExample />
</Preview>

Use `defaultExpandLevel` to pre-expand branches on open. A value of `1` expands top-level branches; `2` expands two levels deep, and so on.

```vue
<VPick :options="options" :default-expand-level="1" />
```

Use `disableBranchNodes` to make branch nodes non-selectable — only leaves can be picked.

```vue
<VPick :options="options" disable-branch-nodes />
```

Combine with `searchable` to filter the tree. Matching nodes auto-expand their ancestor branches so results are always visible, and expansion reverts when the query is cleared.

<Preview :code="TreeSearchableCode">
  <TreeSearchableExample />
</Preview>

### Tree + cascade

Combine `multiple` with tree options to get cascade selection: clicking a branch checks all its descendants, clicking again unchecks them. An indeterminate dash appears when only some children are selected.

<Preview :code="TreeCascadeCode">
  <TreeCascadeExample />
</Preview>

Use `cascade: false` to opt out and get independent node selection instead.

**`valueConsistsOf`** controls what ends up in `v-model`:

| Value                       | What is emitted                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `"LEAF_PRIORITY"` (default) | Only leaf values. A fully-selected branch is implied by its leaves — no branch value appears in the array.                           |
| `"BRANCH_PRIORITY"`         | The topmost selected ancestor replaces its descendants. Selecting all of Electronics emits `["electronics"]` rather than every leaf. |
| `"ALL"`                     | Every checked node — both fully-selected branches and their leaf descendants.                                                        |
| `"ALL_WITH_INDETERMINATE"`  | Like `ALL` but also includes partially-selected (indeterminate) branch values.                                                       |

```vue
<VPick
  v-model="selected"
  :options="options"
  multiple
  value-consists-of="BRANCH_PRIORITY"
/>
```

## Sizing

By default, the trigger hugs its content (`--vpick-width: fit-content`) and the dropdown matches the trigger width at minimum. Give the trigger an explicit width and the dropdown will follow.

```vue
<VPick v-model="selected" :options="options" style="--vpick-width: 18rem" />
```

Options wider than the trigger make the dropdown grow. To pin both widths identical and truncate long labels, also cap the listbox:

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

## Props

These props apply to both `VPickNative` and `VPick`:

| Prop              | Type              | Default      | Description                                                                             |
| ----------------- | ----------------- | ------------ | --------------------------------------------------------------------------------------- |
| `modelValue`      | `any`             | `undefined`  | Selected value. Use `v-model` for two-way binding. With `multiple`, an array of values. |
| `options`         | `OptionOrGroup[]` | **required** | Array of options or option groups.                                                      |
| `placeholder`     | `string`          | `undefined`  | Placeholder text shown when no value is selected.                                       |
| `disabled`        | `boolean`         | `false`      | Disables the select.                                                                    |
| `loading`         | `boolean`         | `false`      | Shows a spinner and disables interaction.                                               |
| `error`           | `string`          | `undefined`  | Error message. Applies error styling and `aria-invalid`.                                |
| `id`              | `string`          | `undefined`  | HTML `id` attribute.                                                                    |
| `name`            | `string`          | `undefined`  | HTML `name` attribute for form submission.                                              |
| `required`        | `boolean`         | `false`      | HTML `required` attribute.                                                              |
| `ariaLabel`       | `string`          | `undefined`  | `aria-label` for accessibility.                                                         |
| `ariaDescribedby` | `string`          | `undefined`  | `aria-describedby` for accessibility.                                                   |
| `labelKey`        | `string`          | `"label"`    | Object key to read each option's visible label from.                                    |
| `valueKey`        | `string`          | `"value"`    | Object key to read each option's value from.                                            |
| `disabledKey`     | `string`          | `"disabled"` | Object key to read each option's disabled flag from.                                    |
| `groupOptionsKey` | `string`          | `"options"`  | Object key for the options array inside a group.                                        |

### VPick-only props

| Prop                 | Type                                                                        | Default            | Description                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `separators`         | `boolean`                                                                   | `false`            | Renders a horizontal divider between adjacent groups in the dropdown.                                                               |
| `rotateIcon`         | `boolean`                                                                   | `false`            | Rotates the trigger chevron 180 degrees when the dropdown is open.                                                                  |
| `searchable`         | `boolean`                                                                   | `false`            | Renders an input trigger with type-ahead filtering instead of a button.                                                             |
| `clearable`          | `boolean`                                                                   | `false`            | Shows a clear button when a value is selected.                                                                                      |
| `multiple`           | `boolean`                                                                   | `false`            | Allows selecting multiple values. `v-model` becomes an array; selected values render as chips in the trigger.                       |
| `filter`             | `(option, query) => boolean`                                                | `undefined`        | Custom filter function for searchable mode. Receives each option and the query string.                                              |
| `noResultsText`      | `string`                                                                    | `"No results"`     | Text displayed when the search query matches no options.                                                                            |
| `teleportTo`         | `string \| HTMLElement`                                                     | `"body"`           | CSS selector or element to mount the dropdown into. The dropdown escapes `overflow: hidden` ancestors.                              |
| `bodyLock`           | `boolean \| null`                                                           | `null`             | Locks body scroll while open. Defaults to `true` for button mode, `false` for searchable mode when set to `null`.                   |
| `childrenKey`        | `string`                                                                    | `"children"`       | Object key for nested children. Options with a non-empty `children` array enable tree mode automatically.                           |
| `defaultExpandLevel` | `number`                                                                    | `undefined`        | Number of levels to pre-expand on open. `1` expands top-level branches, `2` expands two levels, and so on.                          |
| `disableBranchNodes` | `boolean`                                                                   | `false`            | Makes branch nodes (those with children) non-selectable. Only leaf nodes can be picked.                                             |
| `cascade`            | `boolean`                                                                   | `true`             | In `multiple` tree mode, selecting a branch selects all its descendants. Set to `false` for independent node selection.             |
| `valueConsistsOf`    | `"LEAF_PRIORITY" \| "ALL" \| "BRANCH_PRIORITY" \| "ALL_WITH_INDETERMINATE"` | `"LEAF_PRIORITY"`  | Controls which nodes appear in `v-model` when `cascade` is active. See tree cascade section for details.                            |
| `clearOnSelect`      | `boolean`                                                                   | `true`             | Clear the search query after picking an option.                                                                                     |
| `closeOnSelect`      | `boolean`                                                                   | see description    | Close the dropdown after picking. Defaults to `true` in single-select and `false` in `multiple`; an explicit value applies to both. |
| `noChildrenText`     | `string`                                                                    | `"No sub-options"` | Text shown under an expanded branch whose `children` array is empty.                                                                |

## Slots

| Slot      | Scope               | Description                                                                  |
| --------- | ------------------- | ---------------------------------------------------------------------------- |
| `icon`    | —                   | Custom chevron icon. Shown when not loading.                                 |
| `loading` | —                   | Custom loading indicator. Shown when `loading` is true.                      |
| `clear`   | —                   | Custom clear button content. Shown when `clearable` and a value is selected. |
| `empty`   | `{ query: string }` | Custom empty state when no options match the search query.                   |

## Events

| Event      | Payload  | Description                                                                      |
| ---------- | -------- | -------------------------------------------------------------------------------- |
| `search`   | `string` | Emitted on every keystroke in searchable mode.                                   |
| `select`   | `object` | Emitted when an option is picked. Payload is your original option object.        |
| `deselect` | `object` | Emitted when an option is unpicked in `multiple` mode. Same payload as `select`. |

`select` and `deselect` hand back the exact object you passed in `options`, not
VPick's internal shape, so custom fields and `labelKey`/`valueKey` mappings come
through untouched:

```vue
<script setup>
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
]

function onSelect(user) {
  console.log(user.email) // "alice@example.com"
}
</script>

<template>
  <VPick
    v-model="selected"
    :options="users"
    label-key="name"
    value-key="id"
    @select="onSelect"
  />
</template>
```

## Branch nodes with no children

A node is a branch when you give it a `children` array. An **empty** array still
counts, so a category that filters down to nothing stays a branch rather than
turning into a selectable option:

```js
{ label: "Archived", value: "archived", children: [] }  // branch, currently empty
{ label: "Archived", value: "archived" }                // leaf
```

Expanding an empty branch shows `noChildrenText`. That row is inert: it has no
`option` role, and arrow keys skip it.

## Keyboard navigation

| Key                       | Action                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `Enter` / `Space`         | Open dropdown / select focused option. In searchable mode, `Space` types normally.            |
| `Escape`                  | Close dropdown. When closed and `clearable`, clears the selection.                            |
| `Arrow Up` / `Arrow Down` | Move focus between options                                                                    |
| `Home`                    | Focus first option                                                                            |
| `End`                     | Focus last option                                                                             |
| `Arrow Right`             | In tree mode, expand a collapsed branch and move to its first child.                          |
| `Arrow Left`              | In tree mode, collapse an expanded branch; on a leaf or collapsed branch, jump to its parent. |
| `Backspace`               | In `multiple` mode, removes the last selected chip when the search input is empty.            |
| `Tab`                     | Close dropdown and move focus                                                                 |

## Accessibility

- WAI-ARIA listbox pattern (`role="combobox"`, `role="listbox"`, `role="option"`).
- `aria-expanded` reflects open state on the trigger button.
- `aria-activedescendant` tracks the focused option.
- `aria-multiselectable` is set on the listbox in `multiple` mode, with `aria-selected` reflected per option.
- `aria-invalid` is set when the `error` prop is present.
- `aria-disabled` on individual disabled options.
- A visually hidden native `<select>` is kept in sync for form submission and Safari autofill. In `multiple` mode it renders as `<select multiple>` and serializes the selected values.
