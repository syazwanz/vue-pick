---
title: Tree Select
description: Nested options with cascading parent and child selection for Vue 2.7 and Vue 3. Expand levels, unselectable branches, tree search, and value formats.
---

<script setup>
import TreeExample from '../../examples/vpick/tree.vue'
import TreeCode from '../../examples/vpick/tree.vue?raw'
import TreeSearchableExample from '../../examples/vpick/tree-searchable.vue'
import TreeSearchableCode from '../../examples/vpick/tree-searchable.vue?raw'
import TreeCascadeExample from '../../examples/vpick/tree-cascade.vue'
import TreeCascadeCode from '../../examples/vpick/tree-cascade.vue?raw'
import TreeExpandLevelExample from '../../examples/vpick/tree-expand-level.vue'
import TreeExpandLevelCode from '../../examples/vpick/tree-expand-level.vue?raw'
import FlattenExample from '../../examples/vpick/flatten-search-results.vue'
import FlattenCode from '../../examples/vpick/flatten-search-results.vue?raw'
import LoadChildrenExample from '../../examples/vpick/load-children.vue'
import LoadChildrenCode from '../../examples/vpick/load-children.vue?raw'
</script>

# Tree Select

Pass options with a `children` array to enable tree mode. Vue Pick detects
nested data automatically, no extra prop needed. Click the chevron to expand or
collapse a branch; clicking the row itself selects the node.

<Preview :code="TreeCode">
  <TreeExample />
</Preview>

Opening a tree with a value already selected expands whatever branches are
needed to reveal it, and scrolls it into view.

Use `childrenKey` if your data nests under a different field name. See the
[Data Shape guide](/guide/data-shape).

## Expanding on open

`defaultExpandLevel` pre-expands branches. A value of `1` expands top-level
branches; `2` expands two levels deep, and so on.

```vue
<VPick :options="options" :default-expand-level="1" />
```

The third control below pairs it with `disableBranchNodes`, which is the usual
combination: open the categories, but only let leaves be picked.

<Preview :code="TreeExpandLevelCode">
  <TreeExpandLevelExample />
</Preview>

## Unselectable branches

`disableBranchNodes` makes branch nodes non-selectable, so only leaves can be
picked.

```vue
<VPick :options="options" disable-branch-nodes />
```

Clicking the row toggles the branch open or closed instead, so the whole row
stays a useful target rather than only the chevron. The row keeps
`aria-disabled="true"`, since it still is not selectable as an option.

Branch rows read as section headings once they are unselectable, which is when
`--vpick-option-branch-weight` and the branch padding variables are usually
worth setting. See [Theming](/guide/theming#branch-rows).

## Branches with no children

A node is a branch when you give it a `children` array. An **empty** array still
counts, so a category that filters down to nothing stays a branch rather than
turning into a selectable option:

```js
{ label: "Archived", value: "archived", children: [] }  // branch, currently empty
{ label: "Archived", value: "archived" }                // leaf
```

Expanding an empty branch shows `noChildrenText`. That row is inert: it has no
`option` role, and arrow keys skip it. Use the
[`no-children` slot](/components/vpick/slots#no-children) when you need markup
rather than plain text.

## Cascade

Combine `multiple` with tree options to get cascade selection: clicking a branch
checks all its descendants, clicking again unchecks them. An indeterminate dash
appears when only some children are selected.

<Preview :code="TreeCascadeCode">
  <TreeCascadeExample />
</Preview>

Use `cascade: false` to opt out and get independent node selection instead.

### valueConsistsOf

Controls what ends up in `v-model` while `cascade` is active:

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

All four round-trip: feed an emitted value straight back in and the rendered
selection is unchanged.

## Searching a tree

Combine with `searchable` to filter. Matching nodes auto-expand their ancestor
branches so results are always visible, and expansion reverts when the query is
cleared.

<Preview :code="TreeSearchableCode">
  <TreeSearchableExample />
</Preview>

A row survives the filter when it matches, or when it sits on the path to
something that matches. A branch matching on its own label is treated as the
whole category being asked for, so it comes through with everything inside it,
matching or not. Branches with nothing matching under them are dropped, whether
or not `defaultExpandLevel` had already opened them.

An empty branch that matches by name shows its `noChildrenText` placeholder
rather than vanishing.

For matching across the ancestor path rather than a single label, see
[`searchNested`](/components/vpick/search#searching-across-the-ancestor-path).

## Flattening search results

By default, searching a tree keeps the hierarchy: matching nodes stay nested and
their ancestor branches auto-expand so results are visible in context.

`flattenSearchResults` drops the ancestors and the indent, leaving a flat list:

```vue
<VPick :options="options" searchable flatten-search-results />
```

Search both of these for "gaming" to compare. The first walks you down to the
matches; the second just lists them.

<Preview :code="FlattenCode">
  <FlattenExample />
</Preview>

Searching "gaming" in `Electronics > Laptops > Gaming laptop` shows just the
laptop, rather than all three rows.

What survives the filter is otherwise the same as in nested mode. A branch
matching on its own label still brings everything inside it, listed flat and in
document order, and an empty branch matching by name still shows its
placeholder. Only the ancestor rows and the indentation are dropped.

Useful when the tree is deep and users want to scan results rather than navigate
to them. Clearing the query restores the tree, and expansion state is left
untouched throughout, since nothing needs expanding to reveal a match.

## Loading children on demand

For a tree too large to send up front, fetch each branch's children when it is
first opened. Mark those branches with `children: null` and pass
`loadChildren`, which receives the option and returns a promise of its children,
in the same shape as the rest of your options:

```vue
<script setup>
const options = [
  { label: "Electronics", value: "electronics", children: null },
  { label: "Gift card", value: "gift-card" },
]

async function loadChildren(option) {
  const res = await fetch(`/api/categories/${option.value}`)
  return res.json()
}
</script>

<template>
  <VPick :options="options" :load-children="loadChildren" multiple />
</template>
```

Open a branch to load it. Laptops is itself loaded on demand, one level down.

<Preview :code="LoadChildrenCode">
  <LoadChildrenExample />
</Preview>

- **When it loads.** When the branch is opened in an open list, whether by the
  chevron, the arrow keys, `defaultExpandLevel`, or search. A control that is
  never opened sends no requests. Each branch is requested once, and the result
  is kept for as long as you pass the same option objects.
- **While it loads.** The branch shows a spinner and a
  [`loadingChildrenText`](#props) row. If the promise rejects, the row shows
  `loadChildrenErrorText` instead. Clicking it, or closing and reopening the
  branch, tries again.
- **Ticking an unloaded branch.** In `multiple` mode with `cascade`, its children
  load first, and the tick lands once they have, following `valueConsistsOf` as
  usual. Anything nested inside that is also unloaded loads too. If a load fails,
  the selection is left as it was.
- **Values that have not loaded yet.** A saved value can name options under a
  branch nobody has opened. Those values are kept, submitted with the form, and
  shown as chips carrying the raw value until their branch loads.
- **A selected branch that loads later.** If the value names a branch but none of
  its children, the branch stood for all of them. Once they load, the value is
  rewritten to include them, in the shape `valueConsistsOf` asks for, with a
  single `update:modelValue`.

Search only matches options that have loaded. Ticking a branch that holds many
unloaded branches sends one request for each, so if that is the common path,
fetch the tree up front instead.

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

To style one specific option, every row, flat or tree, also carries its value
as `data-value`. It is set for string, number and boolean values:

```css
/* a "Select all" branch that should not show its chevron */
.vpick-option[data-value="all"] .vpick-option-expand {
  visibility: hidden;
}
```

These rules have to be global. `.vpick-option` and the rest belong to Vue Pick
and carry its scope, not yours, so a `<style scoped>` rule cannot reach them,
and a global rule restyles every VPick on the page. To change one instance, set
a variable on the component instead: those are forwarded to the panel. See
[Theming](/guide/theming#branch-rows) for `--vpick-option-branch-weight` and the
row padding variables.

`--vpick-tree-indent` (default `1.375rem`) is the width of one level of nesting,
applied per depth. The default matches the width of the expand chevron and its
gap, so a child's chevron lines up under its parent's label.

## Props

<PropList group="tree" />

<PropList names="childrenKey" />
