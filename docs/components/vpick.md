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
import ChipMotionExample from '../examples/vpick/chip-motion.vue'
import ChipMotionCode from '../examples/vpick/chip-motion.vue?raw'
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

`labelKey` also accepts an array, used as a fallback chain where the first key
with a non-empty value wins. Useful when records are inconsistent:

```vue
<VPick :options="options" :label-key="['label', 'name']" value-key="id" />
```

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

Because of that, `searchable` has no effect alongside `multiple`. The searchable trigger is the only one that draws chips, so passing `:searchable="false"` still renders the input. Doing so logs a warning in development.

<Preview :code="MultipleCode">
  <MultipleExample />
</Preview>

Chips scale in as they are added and out as they are removed, and the remaining
chips slide across to close the gap. Removing the last one is instant, so the
placeholder is not left sitting under a chip that is still on its way out.

Pass `:animate="false"` to switch that off and have chips appear and disappear
outright. `--vpick-chip-transition-duration` tunes the speed while it is on. Add
and remove a few on each to compare:

<Preview :code="ChipMotionCode">
  <ChipMotionExample />
</Preview>

### Tree select

Pass options with a `children` array to enable tree mode. VPick detects nested data automatically, no extra prop needed. Click the chevron to expand or collapse a branch; clicking the row itself selects the node.

<Preview :code="TreeCode">
  <TreeExample />
</Preview>

Opening a tree with a value already selected expands whatever branches are
needed to reveal it, and scrolls it into view.

Use `defaultExpandLevel` to pre-expand branches on open. A value of `1` expands top-level branches; `2` expands two levels deep, and so on.

```vue
<VPick :options="options" :default-expand-level="1" />
```

Use `disableBranchNodes` to make branch nodes non-selectable, so only leaves can be picked.

```vue
<VPick :options="options" disable-branch-nodes />
```

Combine with `searchable` to filter the tree. Matching nodes auto-expand their ancestor branches so results are always visible, and expansion reverts when the query is cleared.

A row survives the filter when it matches, or when it sits on the path to
something that matches. A branch matching on its own label is treated as the
whole category being asked for, so it comes through with everything inside it,
matching or not. Branches with nothing matching under them are dropped, whether
or not `defaultExpandLevel` had already opened them.

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
| `"LEAF_PRIORITY"` (default) | Only leaf values. A fully-selected branch is implied by its leaves, so no branch value appears in the array.                         |
| `"BRANCH_PRIORITY"`         | The topmost selected ancestor replaces its descendants. Selecting all of Electronics emits `["electronics"]` rather than every leaf. |
| `"ALL"`                     | Every checked node, both fully-selected branches and their leaf descendants.                                                         |
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

`--vpick-trigger-width` is measured and set by Vue Pick on every open, so read it
rather than assign it.

## Props

These props apply to both `VPickNative` and `VPick`:

| Prop                   | Type                 | Default      | Description                                                                             |
| ---------------------- | -------------------- | ------------ | --------------------------------------------------------------------------------------- |
| `modelValue` / `value` | `any`                | `undefined`  | Selected value. Use `v-model` for two-way binding. With `multiple`, an array of values. |
| `options`              | `OptionOrGroup[]`    | **required** | Array of options or option groups.                                                      |
| `placeholder`          | `string`             | `undefined`  | Placeholder text shown when no value is selected.                                       |
| `disabled`             | `boolean`            | `false`      | Disables the select.                                                                    |
| `loading`              | `boolean`            | `false`      | Shows a spinner and disables interaction.                                               |
| `error`                | `string`             | `undefined`  | Error message. Applies error styling and `aria-invalid`.                                |
| `id`                   | `string`             | `undefined`  | HTML `id` attribute.                                                                    |
| `name`                 | `string`             | `undefined`  | HTML `name` attribute for form submission.                                              |
| `required`             | `boolean`            | `false`      | HTML `required` attribute.                                                              |
| `ariaLabel`            | `string`             | `undefined`  | `aria-label` for accessibility.                                                         |
| `ariaDescribedby`      | `string`             | `undefined`  | `aria-describedby` for accessibility.                                                   |
| `labelKey`             | `string \| string[]` | `"label"`    | Object key to read each option's visible label from.                                    |
| `valueKey`             | `string`             | `"value"`    | Object key to read each option's value from.                                            |
| `disabledKey`          | `string`             | `"disabled"` | Object key to read each option's disabled flag from.                                    |
| `groupOptionsKey`      | `string`             | `"options"`  | Object key for the options array inside a group.                                        |

### VPick-only props

| Prop                   | Type                                                                        | Default                  | Description                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `separators`           | `boolean`                                                                   | `false`                  | Renders a horizontal divider between adjacent groups in the dropdown.                                                                                                              |
| `rotateIcon`           | `boolean`                                                                   | `false`                  | Rotates the trigger chevron 180 degrees when the dropdown is open.                                                                                                                 |
| `searchable`           | `boolean`                                                                   | `false`                  | Renders an input trigger with type-ahead filtering instead of a button. No effect with `multiple`, which always uses that trigger.                                                 |
| `clearable`            | `boolean`                                                                   | `false`                  | Shows a clear button when a value is selected.                                                                                                                                     |
| `multiple`             | `boolean`                                                                   | `false`                  | Allows selecting multiple values. `v-model` becomes an array; selected values render as chips in the trigger.                                                                      |
| `filter`               | `(option, query) => boolean`                                                | `undefined`              | Custom filter function for searchable mode. Receives each option and the query string.                                                                                             |
| `noResultsText`        | `string`                                                                    | `"No results"`           | Text displayed when the search query matches no options.                                                                                                                           |
| `teleportTo`           | `string \| HTMLElement`                                                     | `"body"`                 | CSS selector or element to mount the dropdown into. The dropdown escapes `overflow: hidden` ancestors.                                                                             |
| `strategy`             | `"auto" \| "absolute" \| "fixed"`                                           | `"auto"`                 | How the dropdown is anchored. See [Anchoring and scroll containers](#anchoring-and-scroll-containers).                                                                             |
| `hideWhenDetached`     | `boolean`                                                                   | `true`                   | Hide the dropdown while its trigger is scrolled out of view. See [Anchoring and scroll containers](#anchoring-and-scroll-containers).                                              |
| `animate`              | `boolean`                                                                   | `true`                   | Animate the multiselect chips. Set to `false` to add and remove them outright.                                                                                                     |
| `bodyLock`             | `boolean`                                                                   | `undefined`              | Locks scrolling while open: the scroll container the dropdown is anchored in, or the page otherwise. Left unset, defaults to `true` in button mode and `false` in searchable mode. |
| `childrenKey`          | `string`                                                                    | `"children"`             | Object key for nested children. Any option with a `children` array enables tree mode automatically.                                                                                |
| `defaultExpandLevel`   | `number`                                                                    | `undefined`              | Number of levels to pre-expand on open. `1` expands top-level branches, `2` expands two levels, and so on.                                                                         |
| `disableBranchNodes`   | `boolean`                                                                   | `false`                  | Makes branch nodes (those with children) non-selectable. Only leaf nodes can be picked.                                                                                            |
| `cascade`              | `boolean`                                                                   | `true`                   | In `multiple` tree mode, selecting a branch selects all its descendants. Set to `false` for independent node selection.                                                            |
| `valueConsistsOf`      | `"LEAF_PRIORITY" \| "ALL" \| "BRANCH_PRIORITY" \| "ALL_WITH_INDETERMINATE"` | `"LEAF_PRIORITY"`        | Controls which nodes appear in `v-model` when `cascade` is active. See tree cascade section for details.                                                                           |
| `clearOnSelect`        | `boolean`                                                                   | `true`                   | Clear the search query after picking an option.                                                                                                                                    |
| `closeOnSelect`        | `boolean`                                                                   | see description          | Close the dropdown after picking. Defaults to `true` in single-select and `false` in `multiple`; an explicit value applies to both.                                                |
| `noChildrenText`       | `string`                                                                    | `"No sub-options"`       | Text shown under an expanded branch whose `children` array is empty.                                                                                                               |
| `noOptionsText`        | `string`                                                                    | `"No options available"` | Text shown when there are no options at all.                                                                                                                                       |
| `backspaceRemoves`     | `boolean`                                                                   | `true`                   | Backspace on an empty search input removes the last chip.                                                                                                                          |
| `deleteRemoves`        | `boolean`                                                                   | `true`                   | Delete on an empty search input removes the last chip.                                                                                                                             |
| `searchNested`         | `boolean`                                                                   | `false`                  | In tree mode, let a multi-word query match across a node's ancestor path.                                                                                                          |
| `alwaysOpen`           | `boolean`                                                                   | `false`                  | Renders the list inline in the page instead of as a dropdown. See [Always open](#always-open).                                                                                     |
| `flattenSearchResults` | `boolean`                                                                   | `false`                  | In tree mode, show only nodes matching the query, as a flat list. See [Flattening search results](#flattening-search-results).                                                     |
| `valueFormat`          | `"id" \| "object"`                                                          | `"id"`                   | Whether `v-model` holds plain values or your original option objects. See [Object values](#object-values).                                                                         |
| `sortValueBy`          | `"ORDER_SELECTED" \| "LEVEL" \| "INDEX"`                                    | `"ORDER_SELECTED"`       | Order of the emitted array and the chips. See [Ordering selected values](#ordering-selected-values).                                                                               |

## Slots

| Slot               | Scope                                                                           | Description                                                                                          |
| ------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `icon`             | —                                                                               | Custom chevron icon. Shown when not loading.                                                         |
| `loading`          | —                                                                               | Custom loading indicator. Shown when `loading` is true.                                              |
| `clear`            | —                                                                               | Custom clear button content. Shown when `clearable` and a value is selected.                         |
| `empty`            | `{ query: string }`                                                             | Custom empty state when no options match the search query.                                           |
| `no-children`      | `{ option: OptionItem }`                                                        | Custom content for an expanded branch whose `children` array is empty. Defaults to `noChildrenText`. |
| `no-children-icon` | `{ option: OptionItem }`                                                        | Icon for that same row, rendered on the column the leaf checkboxes use.                              |
| `value-label`      | `{ option: OptionItem }`                                                        | Custom label for the selected value: the trigger label in single mode, each chip in `multiple` mode. |
| `option-label`     | `{ option: OptionItem, isBranch: boolean, isExpanded: boolean, depth: number }` | Custom label for each row in the list. The chevron, checkbox and check icon stay put.                |

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

### When `deselect` fires

Every way of removing one option emits it: unpicking the row, clicking a chip's
remove button, and `Backspace`/`Delete` on an empty search input.

Two cases behave in a way worth knowing:

- **Clearing emits nothing.** The clear button wipes the whole value in one go
  and emits only `update:modelValue`. Watch the model if you need to react to
  that.
- **In a cascading tree, one event, not one per leaf.** Removing a checked
  branch drops all of its leaves from the value, but `deselect` fires once,
  carrying the branch you acted on.

## Branch nodes with no children

A node is a branch when you give it a `children` array. An **empty** array still
counts, so a category that filters down to nothing stays a branch rather than
turning into a selectable option:

```js
{ label: "Archived", value: "archived", children: [] }  // branch, currently empty
{ label: "Archived", value: "archived" }                // leaf
```

Expanding an empty branch shows `noChildrenText`. That row is inert: it has no
`option` role, and arrow keys skip it. Use the `no-children` slot when you need
markup rather than plain text:

```vue
<VPick :options="options">
  <template #no-children="{ option }"> Nothing under {{ option.label }} </template>
</VPick>
```

For an icon, use `no-children-icon` rather than putting one inside
`no-children`. The row is laid out in the same columns as the options above it,
so an icon in its own slot lands on the column the leaf checkboxes use and the
text stays on the label column. An icon inside the text slot pushes the text one
column to the right instead.

```vue
<VPick :options="options" multiple>
  <template #no-children-icon><WarningIcon /></template>
  <template #no-children="{ option }"> Nothing under {{ option.label }} </template>
</VPick>
```

The column is held open whether or not the slot is filled, so adding an icon
never moves the text.

## Always open

`alwaysOpen` renders the list in the page rather than as a dropdown. It cannot
be closed, and the chevron is hidden.

```vue
<VPick v-model="selected" :options="options" always-open multiple />
```

Useful inside a filter panel or popover, where the list is the content rather
than something to reveal.

The panel is laid out by the browser in normal flow, so it is not teleported,
not positioned, and does not lock body scroll. The root gains a
`vpick--inline` class for styling. Everything else is unchanged: search,
selection, chips and keyboard navigation all behave the same.

Nothing is highlighted until the user presses a key, since a visible list is
not the same as a focused one. A disabled control closes, so the panel is not
left sitting there inert.

## Scroll lock

In button mode the scroll behind an open dropdown is locked (see `bodyLock`).
The lock swallows wheel and touch input instead of hiding the scrollbar, so the
page's layout is never touched: nothing shifts on open or close, and fixed
headers and sidebars stay exactly where they are. The dropdown's own list keeps
scrolling normally.

## Anchoring and scroll containers

The dropdown is rendered outside the component so it is never clipped by an
ancestor with `overflow: hidden`. Where it gets rendered, and how it is
positioned, is decided by `strategy`.

| Value              | Behavior                                                                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"auto"` (default) | Anchors to the page when nothing between the trigger and the root scrolls, to the nearest scrollable ancestor when that ancestor can hold it and the trigger travels with it, and falls back to `"fixed"` otherwise. |
| `"absolute"`       | Always anchors inside the nearest scrollable ancestor, setting `position: relative` on it if it has none.                                                                                                            |
| `"fixed"`          | Always renders in `<body>` with `position: fixed`.                                                                                                                                                                   |

This matters whenever the dropdown is open while something scrolls, whether that
is the window on an ordinary page or a content pane in a dashboard with fixed
chrome around it.

With `"fixed"`, the dropdown's coordinates are relative to the viewport, so they
change on every scrolled pixel and have to be recalculated in JavaScript. The
panel ends up a frame behind the trigger, which is visible as the panel trailing
during a scroll.

Anchored inside the scroll container, the coordinates do not depend on scroll
position at all. The browser moves the panel along with the content, so it stays
glued to the trigger and no work happens per frame.

When the window is what scrolls, `"auto"` anchors to the page and needs nothing
from you. That is the default on an ordinary page.

A trigger inside a `position: fixed` ancestor, such as a modal, is also handled
for you. It stays put while the container behind it scrolls, so there is no
trailing to avoid and anchoring would only let the panel drift away from it.
This is detected and `"fixed"` is kept.

It is the one case where an explicit `strategy="absolute"` is overruled.
Anchoring exists to stop the panel trailing a moving trigger, so with a trigger
that cannot move it has nothing to offer.

Inside a scroll container, `"auto"` prefers anchoring but needs an ancestor that
establishes a containing block. A plain `overflow-y: auto` div does not, so
`"auto"` alone often changes nothing there. There are two ways to opt in.

Add `position: relative` to your scroll container:

```css
.content-pane {
  overflow-y: auto;
  position: relative; /* lets the dropdown anchor here */
}
```

Or pass `strategy="absolute"` and let VPick set it for you:

```vue
<VPick v-model="selected" :options="options" strategy="absolute" />
```

`"absolute"` is an instruction rather than a preference, so it anchors even to a
container `"auto"` would have declined. When that container has no containing
block of its own, VPick sets `position: relative` on it and puts the original
value back when the dropdown closes. A container shared by several dropdowns is
reference counted, so the last one out restores it.

Worth knowing before reaching for it: a containing block applies to every
absolutely-positioned descendant, not only the dropdown. If your pane already
holds `position: absolute` children laid out against some outer ancestor, they
will re-anchor to the pane. `"auto"` never mutates anything, and in development
it logs a warning naming the container it could not anchor to.

Use `"fixed"` when the panel is taller than its container and you would rather it
overflow the container than be clipped by it. When anchored, the panel is
measured against the container, so it flips and shrinks to fit that box instead
of the window.

`teleportTo` and `strategy` answer different questions and are honored
independently: `teleportTo` says where the dropdown is rendered, `strategy` says
how it is positioned once there. Naming a target skips auto-detection, and the
strategy stays `"fixed"` unless you ask for `"absolute"`.

### When the trigger scrolls away

An open dropdown whose trigger has scrolled out of view is anchored to something
the user can no longer see. `hideWhenDetached` hides it until the trigger comes
back:

```vue
<VPick :options="options" :hide-when-detached="false" />
```

It is hidden, not closed, so the selection, the focus position and any search
query are all still there when you scroll back.

This measures clipping, not overlap. A trigger covered by a fixed header is not
clipped by anything, so the panel stays visible and paints over the header. Give
the panel a lower `--vpick-listbox-z-index` than your header if you would rather
it slid underneath.

## Empty states

Two different situations, two messages:

- `noOptionsText` (default `"No options available"`) when `options` is empty
- `noResultsText` (default `"No results"`) when a search matches nothing

The `empty` slot replaces whichever applies.

## Searching across the ancestor path

`searchNested` lets a multi-word query match a node's full path rather than just
its own label:

```vue
<VPick :options="options" searchable search-nested />
```

Searching "electronics gaming" finds `Gaming` under `Electronics > Laptops`,
because every word appears somewhere in that path. Single-word queries are
unaffected, and words from unrelated branches still do not match.

## Flattening search results

By default, searching a tree keeps the hierarchy: matching nodes stay nested and
their ancestor branches auto-expand so results are visible in context.

`flattenSearchResults` drops the ancestors and the indent, leaving a flat list:

```vue
<VPick :options="options" searchable flatten-search-results />
```

Searching "gaming" in `Electronics > Laptops > Gaming` shows just `Gaming`,
rather than all three rows.

What survives the filter is otherwise the same as in nested mode. A branch
matching on its own label still brings everything inside it, listed flat and in
document order, and an empty branch matching by name still shows its
placeholder. Only the ancestor rows and the indentation are dropped.

Useful when the tree is deep and users want to scan results rather than navigate
to them. Clearing the query restores the tree, and expansion state is left
untouched throughout, since nothing needs expanding to reveal a match.

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
them up yourself.

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

## Ordering selected values

By default the emitted array keeps the order options were picked in. Use
`sortValueBy` to order by the tree instead:

| Value                        | Order                                           |
| ---------------------------- | ----------------------------------------------- |
| `"ORDER_SELECTED"` (default) | The order the user picked them                  |
| `"INDEX"`                    | Position in the tree, top to bottom as rendered |
| `"LEVEL"`                    | Shallowest first, ties broken by position       |

This applies to both `v-model` and the chips, so a value handed in unsorted is
still displayed in order.

## Customising the selected label

The `value-label` slot replaces the trigger label in single mode and each chip
in `multiple` mode. It receives the option, including `raw`, which is the exact
object you passed in `options`:

```vue
<VPick v-model="selected" :options="users" label-key="name" value-key="id">
  <template #value-label="{ option }">
    {{ option.raw.nickname || option.label }}
  </template>
</VPick>
```

Useful when the display label is derived rather than a single field, which
`labelKey` cannot express.

## Customising option rows

The `option-label` slot replaces the label on each row in the list. The chevron,
checkbox and check icon are unaffected, so the row keeps working as an option.
In tree mode the scope also carries the node's position:

```vue
<VPick v-model="selected" :options="categories" multiple disable-branch-nodes>
  <template #option-label="{ option, isBranch, depth }">
    <strong v-if="isBranch">{{ option.label }}</strong>
    <template v-else>{{ option.label }} ({{ depth }})</template>
  </template>
</VPick>
```

`isExpanded` is also in scope, for drawing an affordance of your own on branch
rows.

## Styling branch and leaf rows

In tree mode each option row carries a modifier class and its nesting depth, so
you can style branches differently from leaves without a slot:

```css
.vpick-option--branch {
  font-weight: 600;
}
.vpick-option--leaf {
  color: #475569;
}
/* top-level branches only */
.vpick-option--branch[data-depth="0"] {
  text-transform: uppercase;
}
```

`--branch` is set whenever the node has a `children` array, empty or not.
`--leaf` and `data-depth` are only applied in tree mode, so flat lists stay
untouched.

These rules have to be global. The dropdown panel is teleported out of the
component, so scoped CSS cannot reach it, and a global rule restyles every VPick
on the page. To change one instance, set a variable on the component instead:
those are forwarded to the panel. See
[Theming](/guide/theming#branch-rows) for `--vpick-option-branch-weight` and the
row padding variables.

## Unselectable branches

With `disableBranchNodes`, branch rows cannot be selected. Clicking the row
toggles the branch open or closed instead, so the whole row stays a useful
target rather than only the chevron. The row keeps `aria-disabled="true"`,
since it still is not selectable as an option.

## Keyboard navigation

| Key                       | Action                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Enter` / `Space`         | Open dropdown / select focused option. In searchable mode, `Space` types normally.                                         |
| `Escape`                  | Close dropdown. In searchable mode, when already closed and `clearable`, clears the selection.                             |
| `Arrow Up` / `Arrow Down` | Move focus between options                                                                                                 |
| `Home`                    | Focus first option                                                                                                         |
| `End`                     | Focus last option                                                                                                          |
| `Arrow Right`             | In tree mode, expand a collapsed branch and move to its first child.                                                       |
| `Arrow Left`              | In tree mode, collapse an expanded branch; on a leaf or collapsed branch, jump to its parent.                              |
| `Backspace`               | In `multiple` mode, removes the last selected chip when the search input is empty. Disable with `backspaceRemoves: false`. |
| `Delete`                  | Same as `Backspace`. Disable with `deleteRemoves: false`.                                                                  |
| `Tab`                     | Close dropdown and move focus                                                                                              |

## Labelling

Pair a label with `for` and `id` rather than wrapping the component in it:

```vue
<label for="status">Status</label>
<VPick id="status" v-model="selected" :options="options" multiple />
```

`id` is applied to the control itself, the `<button role="combobox">` in button
mode and the `<input role="combobox">` in searchable and `multiple`, so `for`
resolves to the right element and clicking the label focuses it.

Wrapping instead binds the label to its first labelable descendant. In
`multiple` mode that is the first chip's remove button, so clicking the label
deletes a chip. `ariaLabel` is the alternative when there is no visible label.

## Accessibility

- WAI-ARIA listbox pattern (`role="combobox"`, `role="listbox"`, `role="option"`).
- `aria-expanded` reflects open state on the trigger button.
- `aria-activedescendant` tracks the focused option.
- `aria-multiselectable` is set on the listbox in `multiple` mode, with `aria-selected` reflected per option.
- `aria-invalid` is set when the `error` prop is present.
- `aria-disabled` on individual disabled options.
- A visually hidden native `<select>` is kept in sync for form submission and Safari autofill. In `multiple` mode it renders as `<select multiple>` and serializes the selected values.
