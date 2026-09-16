---
title: Multiselect
description: Select multiple values with VPick. Removable chips, select and deselect events, keyboard removal, and value ordering for Vue 2.7 and Vue 3.
---

<script setup>
import MultipleExample from '../../examples/vpick/multiple.vue'
import MultipleCode from '../../examples/vpick/multiple.vue?raw'
import ChipMotionExample from '../../examples/vpick/chip-motion.vue'
import ChipMotionCode from '../../examples/vpick/chip-motion.vue?raw'
import SortValueByExample from '../../examples/vpick/sort-value-by.vue'
import SortValueByCode from '../../examples/vpick/sort-value-by.vue?raw'
</script>

# Multiselect

`multiple` allows selecting more than one option. `v-model` becomes an array,
and the trigger renders each selected value as a removable chip. Picking an
option does not close the list, so the user can keep going.

<Preview :code="MultipleCode">
  <MultipleExample />
</Preview>

`multiple` always uses the searchable trigger, since it is the only one that
draws chips, so chips and the input share one row. Passing `:searchable="false"`
has no effect and logs a warning in development. Combine with `clearable` to
expose a single button that empties the array.

## Removing chips

Three ways, all equivalent:

- Click the chip's own remove button
- Unpick the row in the list
- Press `Backspace` or `Delete` while the search input is empty, which removes
  the last chip

The keyboard route can be switched off per key with `backspaceRemoves` and
`deleteRemoves`, for a form where an accidental `Backspace` would be costly:

```vue
<VPick
  v-model="selected"
  :options="options"
  multiple
  :backspace-removes="false"
/>
```

## Chip motion

Chips scale in as they are added and out as they are removed, and the remaining
chips slide across to close the gap. Removing the last one is instant, so the
placeholder is not left sitting under a chip that is still on its way out.

Pass `:animate="false"` to switch that off and have chips appear and disappear
outright. `--vpick-chip-transition-duration` tunes the speed while it is on. Add
and remove a few on each to compare:

<Preview :code="ChipMotionCode">
  <ChipMotionExample />
</Preview>

To switch the motion off, use `animate` rather than a zero duration. A duration
of zero still runs the transition, just with no time to run it in, which leaves
the chips mid-reflow for a frame.

Motion is disabled outright for visitors whose system asks for less of it, via
`prefers-reduced-motion`. See [Theming](/guide/theming#reduced-motion).

## Events

| Event      | Payload  | Description                                                                      |
| ---------- | -------- | -------------------------------------------------------------------------------- |
| `search`   | `string` | Emitted on every keystroke in searchable mode.                                   |
| `select`   | `object` | Emitted when an option is picked. Payload is your original option object.        |
| `deselect` | `object` | Emitted when an option is unpicked in `multiple` mode. Same payload as `select`. |

`select` and `deselect` hand back the exact object you passed in `options`, not
Vue Pick's internal shape, so custom fields and `labelKey`/`valueKey` mappings
come through untouched:

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

## Ordering selected values

By default the emitted array keeps the order options were picked in. Use
`sortValueBy` to order by the tree instead:

| Value                        | Order                                           |
| ---------------------------- | ----------------------------------------------- |
| `"ORDER_SELECTED"` (default) | The order the user picked them                  |
| `"INDEX"`                    | Position in the tree, top to bottom as rendered |
| `"LEVEL"`                    | Shallowest first, ties broken by position       |

This applies to both `v-model` and the chips, so a value handed in unsorted is
still displayed in order. Pick a few bottom-up, then change the mode:

<Preview :code="SortValueByCode">
  <SortValueByExample />
</Preview>

## Styling chips

Chips are themed with their own set of CSS custom properties, covering the
background, radius, font size and the remove button. See
[Theming](/guide/theming#multiselect-chip-variables).

The option rows also change in `multiple` mode: each one grows a checkbox on the
left instead of the check icon on the right. Those have
[their own variables](/guide/theming#multiselect-checkbox-variables) too.

## Props

<PropList group="multiple" />

<PropList names="animate,clearable" />
