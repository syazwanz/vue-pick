---
title: Slots
description: Customize VPick with slots. Replace the chevron, the loading indicator, the selected label, option rows, and the empty state.
---

# Slots

Eight slots, covering the trigger, the rows, and the empty state. The full list
with scopes is on the [API Reference](/components/vpick/api#slots); this page is how
to use each one.

## Trigger icons

`icon` replaces the chevron and `loading` replaces the spinner. They are
mutually exclusive: whichever applies to the current state is the one rendered.

```vue
<VPick :options="options">
  <template #icon><MyChevron /></template>
  <template #loading><MySpinner /></template>
</VPick>
```

`clear` replaces the contents of the clear button, which appears when
`clearable` is set and a value is selected.

## value-label

Replaces the trigger label in single mode, and each chip in `multiple` mode. It
receives the option, including `raw`, which is the exact object you passed in
`options`:

```vue
<VPick v-model="selected" :options="users" label-key="name" value-key="id">
  <template #value-label="{ option }">
    {{ option.raw.nickname || option.label }}
  </template>
</VPick>
```

Useful when the display label is derived rather than a single field, which
`labelKey` cannot express.

## option-label

Replaces the label on each row in the list. The chevron, checkbox and check icon
are unaffected, so the row keeps working as an option. In tree mode the scope
also carries the node's position:

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

## empty

Replaces the empty state, whichever of the two applies: `noOptionsText` when
there are no options at all, `noResultsText` when a search matched nothing. The
scope carries the current `query`, so the message can quote it.

```vue
<VPick :options="options" searchable>
  <template #empty="{ query }">
    Nothing matches "{{ query }}". <a href="/new">Add it?</a>
  </template>
</VPick>
```

See [Empty states](/components/vpick/search#empty-states).

## no-children

Replaces the placeholder row shown under an expanded branch whose `children`
array is empty. Defaults to `noChildrenText`.

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

Colour that icon with `--vpick-option-empty-icon-color` and have it draw with
`currentColor`. It renders inside the teleported panel, so scoped CSS cannot
reach it. See [Theming](/guide/theming#the-selected-row).

## A note on scoped styles

Vue Pick's own elements inside the panel, `.vpick-option` and the rest, carry
Vue Pick's scope, not yours. A `<style scoped>` rule in the file that renders the
`VPick` cannot reach them, and that is true whether or not the panel is
teleported. Two ways round it:

- Set a CSS custom property on the component. Those are forwarded into the
  panel, which keeps the change to that one instance. This is the one to reach
  for first.
- Write a global rule, remembering it will hit every VPick on the page.

See [Theming](/guide/theming) for the variables, and
[Styling branch and leaf rows](/components/vpick/tree-select#styling-branch-and-leaf-rows)
for the class hooks.
