---
title: Migrating from vue-treeselect
description: Move from vue-treeselect to VPick on Vue 2.7 or Vue 3. Prop, event and slot mapping, default differences, and a prompt for your AI agent.
---

# Migrating from vue-treeselect

This page maps `@riophae/vue-treeselect` 0.4 to `VPick`. VPick runs on Vue 2.7
and Vue 3 with the same props, so you can replace the old component while still
on 2.7 and keep it after you upgrade.

## Use your AI agent

Paste this into your coding agent (Claude Code, Cursor, Copilot and so on) from
the root of your project:

```text
Replace @riophae/vue-treeselect with vue-pick in this project.

1. Read https://vue-pick.js.org/migration/vue-treeselect.md for the mapping
   and https://vue-pick.js.org/llms-full.txt for the full vue-pick API.
2. Install vue-pick. Import "vue-pick/style.css" once in the app entry.
3. Replace every <treeselect> with <VPick>. Import VPick from "vue-pick/vue2"
   on Vue 2.7 and from "vue-pick" on Vue 3.
4. Map props, events and slots using the tables in the guide. Add the props
   under "Keep the same behavior" so each component behaves as it does today.
5. Keep the shape of every bound value unchanged.
6. Where a prop has no equivalent, leave a TODO comment instead of guessing.
7. Remove @riophae/vue-treeselect and its CSS import once nothing uses it.
8. List every file you changed and every TODO you left.
```

If you wrap treeselect in your own component, ask the agent to change the
wrapper first. Every page that uses it then moves over at once.

## Install

```sh
npm install vue-pick
npm uninstall @riophae/vue-treeselect
```

```ts
// main.ts: replaces "@riophae/vue-treeselect/dist/vue-treeselect.css"
import "vue-pick/style.css"
```

```ts
import { VPick } from "vue-pick/vue2" // Vue 2.7
import { VPick } from "vue-pick" // Vue 3
```

## A basic swap

```vue
<!-- Before -->
<treeselect v-model="value" :options="options" :multiple="true" />

<!-- After -->
<VPick
  v-model="value"
  :options="options"
  multiple
  searchable
  clearable
  value-key="id"
  disabled-key="isDisabled"
  value-consists-of="BRANCH_PRIORITY"
/>
```

vue-treeselect reads `id`, `label`, `children` and `isDisabled` from each
option. VPick reads `value`, `label`, `children` and `disabled`, so the two keys
that differ are set with `value-key` and `disabled-key`. Your options array
stays as it is.

## Keep the same behavior

These defaults differ. Set the VPick prop to keep what vue-treeselect did:

| vue-treeselect default                         | VPick default            | To keep it                            |
| ---------------------------------------------- | ------------------------ | ------------------------------------- |
| `searchable: true`                             | `false`                  | `searchable`                          |
| `clearable: true`                              | `false`                  | `clearable`                           |
| `valueConsistsOf: BRANCH_PRIORITY`             | `LEAF_PRIORITY`          | `value-consists-of="BRANCH_PRIORITY"` |
| `closeOnSelect: true`                          | stays open in `multiple` | `:close-on-select="true"`             |
| `clearOnSelect: false`                         | `true`                   | `:clear-on-select="false"`            |
| One chip per value entry                       | Merges full branches     | `:compact-chips="false"`              |
| Ticking an unloaded branch selects only its id | Loads its children first | `:load-on-select="false"`             |

The last two only matter in `multiple` tree mode, and the last one only with
lazy loading.

## Props

| vue-treeselect                                | VPick                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `value` / `v-model`                           | `v-model`                                                                                                           |
| `options`                                     | `options`                                                                                                           |
| `normalizer`                                  | `label-key`, `value-key`, `children-key`, `disabled-key` (see below)                                                |
| `multiple`                                    | `multiple`                                                                                                          |
| `flat`                                        | `:cascade="false"`                                                                                                  |
| `valueConsistsOf`                             | `value-consists-of`, same four values                                                                               |
| `valueFormat`                                 | `value-format`, `"id"` or `"object"`                                                                                |
| `sortValueBy`                                 | `sort-value-by`, same three values                                                                                  |
| `defaultExpandLevel`                          | `default-expand-level`                                                                                              |
| `disableBranchNodes`                          | `disable-branch-nodes`                                                                                              |
| `searchable`                                  | `searchable`                                                                                                        |
| `searchNested`                                | `search-nested`                                                                                                     |
| `flattenSearchResults`                        | `flatten-search-results`                                                                                            |
| `matchKeys`                                   | `search-keys` (the label is always searched)                                                                        |
| `clearable`                                   | `clearable`                                                                                                         |
| `clearOnSelect`                               | `clear-on-select`                                                                                                   |
| `closeOnSelect`                               | `close-on-select`                                                                                                   |
| `alwaysOpen`                                  | `always-open`                                                                                                       |
| `backspaceRemoves`                            | `backspace-removes`                                                                                                 |
| `deleteRemoves`                               | `delete-removes`                                                                                                    |
| `loadOptions` (`LOAD_CHILDREN_OPTIONS`)       | `load-children`                                                                                                     |
| `loadOptions` (`ASYNC_SEARCH`) + `async`      | `fetch-options`                                                                                                     |
| `noChildrenText`                              | `no-children-text`                                                                                                  |
| `noOptionsText`                               | `no-options-text`                                                                                                   |
| `noResultsText`                               | `no-results-text`                                                                                                   |
| `searchPromptText`                            | `search-prompt-text`                                                                                                |
| `loadingText`                                 | `loading-children-text`, `searching-text`                                                                           |
| `retryText`                                   | `load-children-error-text`, `search-error-text`                                                                     |
| `placeholder`, `disabled`, `name`, `required` | same names                                                                                                          |
| `instanceId`                                  | `id`                                                                                                                |
| `appendToBody`                                | Not needed. The list already renders outside clipping containers. See [Positioning](/components/vpick/positioning). |
| `maxHeight`                                   | `--vpick-listbox-max-height` CSS variable                                                                           |
| `zIndex`                                      | `--vpick-listbox-z-index` CSS variable                                                                              |
| `openDirection`                               | Not needed. The list flips when there is no room below.                                                             |
| `autoFocus`                                   | Call `focus()` on the component ref in `onMounted`                                                                  |
| `joinValues`, `delimiter`                     | Not needed. With `name`, each selected value posts under that name.                                                 |

### normalizer

VPick reads keys, not a function. When `normalizer` only renames fields, use the
key props:

```vue
<!-- Before -->
<treeselect
  :options="options"
  :normalizer="
    (node) => ({ id: node.key, label: node.name, children: node.subOptions })
  "
/>

<!-- After -->
<VPick
  :options="options"
  value-key="key"
  label-key="name"
  children-key="subOptions"
/>
```

If it computes a value, for example joining two fields into a label, map your
options once with `computed` and pass the result. `label-key` also takes a list,
`["name", "title"]`, and uses the first field that has a value.

### Lazy loading

vue-treeselect sends every load through `loadOptions`. VPick splits it in two.
Branches that load on expand still use `children: null`:

```js
// Before
function loadOptions({ action, parentNode, callback }) {
  if (action === "LOAD_CHILDREN_OPTIONS") {
    api.children(parentNode.id).then((children) => {
      parentNode.children = children
      callback()
    })
  }
}

// After: return the children, VPick puts them in place
function loadChildren(option) {
  return api.children(option.id)
}
```

Server search with `async` becomes `fetch-options`, which gets the query and an
`AbortSignal` for requests that go stale:

```js
// After
function fetchOptions(query, { signal }) {
  return api.search(query, { signal })
}
```

Loading the root options from `loadOptions` (`LOAD_ROOT_OPTIONS`) has no
equivalent. Fetch them before rendering and pass them as `options`.

## Not supported

These have no VPick equivalent: `limit`, `limitText`, `showCount`,
`showCountOf`, `branchNodesFirst`, `openOnClick`, `openOnFocus`, `cacheOptions`,
`defaultOptions`, `autoLoadRootOptions`, `allowClearingDisabled`,
`allowSelectingDisabledDescendants`, `autoSelectAncestors`,
`autoSelectDescendants`, `autoDeselectAncestors`, `autoDeselectDescendants`,
`beforeClearAll`, `clearAllText`, `clearValueText`, `tabIndex` and
`disableFuzzyMatching`.

Search matches parts of words and ignores accents, but it is not fuzzy. For
typo-tolerant search, see [Fuse.js](/search-engines/fuse).

## Events

| vue-treeselect                     | VPick                                                        |
| ---------------------------------- | ------------------------------------------------------------ |
| `input`                            | `v-model` (`input` on Vue 2.7, `update:modelValue` on Vue 3) |
| `select(node, instanceId)`         | `select(option)`, your original option object                |
| `deselect(node, instanceId)`       | `deselect(option)`                                           |
| `open(instanceId)`                 | `open`                                                       |
| `close(value, instanceId)`         | `close`                                                      |
| `search-change(query, instanceId)` | `search(query)`                                              |

## Slots

| vue-treeselect                             | VPick                                                         |
| ------------------------------------------ | ------------------------------------------------------------- |
| `option-label` with `{ node, count, ... }` | `option-label` with `{ option, isBranch, isExpanded, depth }` |
| `value-label` with `{ node }`              | `value-label` with `{ option }`                               |
| `before-list`, `after-list`                | Not supported                                                 |

In both slots, `option.raw` is the object you passed in, so fields beyond the
label are still there. See [Slots](/components/vpick/slots).

## Styling

The `vue-treeselect__*` classes do not exist in VPick, so CSS that targets them
needs rewriting. Most of it becomes a CSS variable. See
[Theming](/guide/theming) and
[Styling branch and leaf rows](/components/vpick/tree-select#styling-branch-and-leaf-rows).

To keep your existing rules, put the old names back with `classes`:

```vue
<VPick
  :classes="{
    trigger: 'vue-treeselect__control',
    chip: 'vue-treeselect__multi-value-item',
    listbox: 'vue-treeselect__menu',
    option: 'vue-treeselect__option',
  }"
/>
```

State classes like `vue-treeselect__option--highlight` become attributes, such
as `.vue-treeselect__option[data-highlighted]`. See
[Your own class names](/guide/theming#your-own-class-names).

Tests or CSS that select an option by `data-id` can keep working with
`optionAttrs`:

```vue
<VPick :option-attrs="(o) => ({ 'data-id': o.value })" />
```
