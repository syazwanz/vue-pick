---
title: Migrating from vue-select
description: Move from vue-select to VPick on Vue 2.7 or Vue 3. Prop, event and slot mapping, default differences, and a prompt for your AI agent.
---

# Migrating from vue-select

This page maps `vue-select` 3.x (Vue 2) and the 4.0 beta (Vue 3) to `VPick`.
VPick runs on Vue 2.7 and Vue 3 with the same props, so you can replace the old
component while still on 2.7 and keep it after you upgrade.

## Use your AI agent

Paste this into your coding agent (Claude Code, Cursor, Copilot and so on) from
the root of your project:

```text
Replace vue-select with vue-pick in this project.

1. Read https://vue-pick.js.org/migration/vue-select.md for the mapping
   and https://vue-pick.js.org/llms-full.txt for the full vue-pick API.
2. Install vue-pick. Import "vue-pick/style.css" once in the app entry.
3. Replace every <v-select> with <VPick>. Import VPick from "vue-pick/vue2"
   on Vue 2.7 and from "vue-pick" on Vue 3.
4. Map props, events and slots using the tables in the guide. Add the props
   under "Keep the same behavior" so each component behaves as it does today.
5. Keep the shape of every bound value unchanged. Without `reduce`, that
   means value-format="object".
6. Where a prop has no equivalent, leave a TODO comment instead of guessing.
7. Remove vue-select and its CSS import once nothing uses it.
8. List every file you changed and every TODO you left.
```

If you wrap vue-select in your own component, ask the agent to change the
wrapper first. Every page that uses it then moves over at once.

## Install

```sh
npm install vue-pick
npm uninstall vue-select
```

```ts
// main.ts: replaces "vue-select/dist/vue-select.css"
import "vue-pick/style.css"
```

```ts
import { VPick } from "vue-pick/vue2" // Vue 2.7
import { VPick } from "vue-pick" // Vue 3
```

## A basic swap

What `v-model` holds decides the props. vue-select holds the whole option object
unless you pass `reduce`.

With `reduce`, `v-model` holds one field of the option. Name that field with
`value-key`:

```vue
<!-- Before -->
<v-select v-model="countryId" :options="countries" :reduce="(c) => c.id" />

<!-- After -->
<VPick
  v-model="countryId"
  :options="countries"
  value-key="id"
  searchable
  clearable
/>
```

Without `reduce`, `v-model` holds the object. Use `value-format="object"`, and
name a field that is unique per option with `value-key`:

```vue
<!-- Before -->
<v-select v-model="country" :options="countries" />

<!-- After -->
<VPick
  v-model="country"
  :options="countries"
  value-key="id"
  value-format="object"
  searchable
  clearable
/>
```

### Plain string options

vue-select accepts `["Apple", "Banana"]`. VPick needs objects, so map them once:

```js
const options = computed(() => fruits.map((f) => ({ label: f, value: f })))
```

`v-model` then still holds the plain string.

## Keep the same behavior

These defaults differ. Set the VPick prop to keep what vue-select did:

| vue-select default           | VPick default            | To keep it                |
| ---------------------------- | ------------------------ | ------------------------- |
| `searchable: true`           | `false`                  | `searchable`              |
| `clearable: true`            | `false`                  | `clearable`               |
| `closeOnSelect: true`        | stays open in `multiple` | `:close-on-select="true"` |
| Accepts plain string options | Objects only             | Map them, see above       |

## Props

| vue-select                         | VPick                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `value` / `modelValue` / `v-model` | `v-model`                                                                                                                     |
| `options`                          | `options`                                                                                                                     |
| `label`                            | `label-key`                                                                                                                   |
| `reduce`                           | `value-key` (see [A basic swap](#a-basic-swap))                                                                               |
| `getOptionKey`                     | `value-key`                                                                                                                   |
| `getOptionLabel`                   | `label-key`, or the `value-label` and `option-label` slots                                                                    |
| `selectable`                       | A `disabled` field on each option, or `disabled-key`                                                                          |
| `multiple`                         | `multiple`                                                                                                                    |
| `searchable`                       | `searchable`                                                                                                                  |
| `clearable`                        | `clearable`                                                                                                                   |
| `filterBy`, `filter`               | `filter`, called as `(option, query) => boolean`                                                                              |
| `filterable: false` with `@search` | `fetch-options` (see [Server search](#server-search))                                                                         |
| `closeOnSelect`                    | `close-on-select`                                                                                                             |
| `clearSearchOnSelect`              | `clear-on-select`                                                                                                             |
| `deselectFromDropdown`             | Not needed. In `multiple` mode, picking a selected row unpicks it.                                                            |
| `placeholder`, `disabled`          | same names                                                                                                                    |
| `inputId`                          | `id`                                                                                                                          |
| `appendToBody`                     | Not needed. The list already renders outside clipping containers. See [Positioning](/components/vpick/positioning).           |
| `calculatePosition`                | `floating-ui` (see [Floating UI](/positioning-engines/floating-ui))                                                           |
| `loading`                          | `loading` disables the control while it spins. For search requests, use `fetch-options`, which shows its own searching state. |

### filterBy

vue-select calls `filterBy(option, label, search)`. VPick calls
`filter(option, query)`, where `option.label` is the label and `option.raw` is
your original object:

```js
// Before
const filterBy = (option, label, search) =>
  label.toLowerCase().startsWith(search.toLowerCase())

// After
const filter = (option, query) =>
  option.label.toLowerCase().startsWith(query.toLowerCase())
```

### Server search

vue-select turns off its own filtering with `:filterable="false"` and hands you
the query and a loading toggle on `@search`. VPick does both through
`fetch-options`. Return the options, or a promise of them:

```js
// Before
function onSearch(search, loading) {
  loading(true)
  api.search(search).then((results) => {
    options.value = results
    loading(false)
  })
}

// After
function fetchOptions(query, { signal }) {
  return api.search(query, { signal })
}
```

```vue
<VPick :options="[]" :fetch-options="fetchOptions" />
```

Requests are debounced, and `signal` cancels one that a newer query replaces.
See [Searching a server](/components/vpick/search#searching-a-server).

## Not supported

These have no VPick equivalent: `taggable`, `pushTags`, `createOption`,
`noDrop`, `selectOnTab`, `selectOnKeyCodes`, `onTab`, `mapKeydown`,
`dropdownShouldOpen`, `components`, `transition`, `resetOnOptionsChange`,
`clearSearchOnBlur`, `searchInputQuerySelector`, `autocomplete`, `tabindex`,
`dir` and `uid`.

Creating new options by typing (tagging) is the largest gap. If you rely on it,
keep those fields on vue-select for now.

## Events

| vue-select                                                                                | VPick                                                        |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `input`                                                                                   | `v-model` (`input` on Vue 2.7, `update:modelValue` on Vue 3) |
| `option:selected`                                                                         | `select(option)`, your original option object                |
| `option:deselected`                                                                       | `deselect(option)`                                           |
| `search(search, loading)`                                                                 | `search(query)`, or `fetch-options` for requests             |
| `open`, `close`                                                                           | `open`, `close`                                              |
| `option:selecting`, `option:deselecting`, `option:created`, `search:focus`, `search:blur` | Not supported                                                |

## Slots

| vue-select                                                 | VPick                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| `option`                                                   | `option-label` with `{ option, isBranch, isExpanded, depth }` |
| `selected-option`                                          | `value-label` with `{ option }`                               |
| `no-options`                                               | `empty` with `{ query }`                                      |
| `spinner`                                                  | `loading`                                                     |
| `open-indicator`                                           | `icon`                                                        |
| `search`, `header`, `footer`, `list-header`, `list-footer` | Not supported                                                 |

vue-select passes the option's fields straight into the slot. In VPick they are
on `option.raw`, the object you passed in:

```vue
<!-- Before -->
<template #option="{ name, flag }">{{ flag }} {{ name }}</template>

<!-- After -->
<template #option-label="{ option }">
  {{ option.raw.flag }} {{ option.raw.name }}
</template>
```

See [Slots](/components/vpick/slots).

## Styling

The `vs__*` classes do not exist in VPick, so CSS that targets them needs
rewriting. Most of it becomes a CSS variable. See [Theming](/guide/theming).
