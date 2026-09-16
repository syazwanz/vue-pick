---
title: VPick API
description: Complete API reference for VPick. Every prop, slot, and event, with types and defaults, for Vue 2.7 and Vue 3.
---

# VPick API

Every prop, slot and event in one place. Each prop links to the page that
explains it in context.

## Props

<PropList />

## Slots

| Slot               | Scope                                                                           | Description                                                                                          |
| ------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `icon`             | none                                                                            | Custom chevron icon. Shown when not loading.                                                         |
| `loading`          | none                                                                            | Custom loading indicator. Shown when `loading` is true.                                              |
| `clear`            | none                                                                            | Custom clear button content. Shown when `clearable` and a value is selected.                         |
| `empty`            | `{ query: string }`                                                             | Custom empty state, for no options at all or a search that matches nothing.                          |
| `no-children`      | `{ option: OptionItem }`                                                        | Custom content for an expanded branch whose `children` array is empty. Defaults to `noChildrenText`. |
| `no-children-icon` | `{ option: OptionItem }`                                                        | Icon for that same row, rendered on the column the leaf checkboxes use.                              |
| `value-label`      | `{ option: OptionItem }`                                                        | Custom label for the selected value: the trigger label in single mode, each chip in `multiple` mode. |
| `option-label`     | `{ option: OptionItem, isBranch: boolean, isExpanded: boolean, depth: number }` | Custom label for each row in the list. The chevron, checkbox and check icon stay put.                |

Usage for each is on the [Slots page](/components/vpick/slots).

## Events

| Event               | Payload  | Description                                                                                         |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `any`    | Emitted when the selection changes. Vue 2 emits `input`, which is what `v-model` listens for there. |
| `search`            | `string` | Emitted on every keystroke in searchable mode.                                                      |
| `select`            | `object` | Emitted when an option is picked. Payload is your original option object.                           |
| `deselect`          | `object` | Emitted when an option is unpicked in `multiple` mode. Same payload as `select`.                    |

`select` and `deselect` hand back the exact object you passed in `options`. See
[when `deselect` fires](/components/vpick/multiselect#when-deselect-fires) for
the two cases that are not obvious.

## CSS custom properties

Theming is documented separately, since the variables are shared with
`VPickNative`. See [Theming](/guide/theming).

## Types

```ts
interface OptionItem {
  label: string
  value: any
  disabled?: boolean
  // An array, even an empty one, marks this node as a branch.
  children?: OptionItem[]
  // Set by Vue Pick, not by you: the original object you passed in.
  // Handed back by `select`/`deselect` and available in slots.
  raw?: unknown
}

interface OptionGroup {
  label: string
  disabled?: boolean
  options: OptionItem[]
}

type OptionOrGroup = OptionItem | OptionGroup
```

See the [Data Shape guide](/guide/data-shape) for reading your own shapes
without transforming them.
