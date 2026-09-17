---
title: Search
description: Type-ahead filtering for VPick. Searchable input trigger, custom matching, clearing, and empty states for Vue 2.7 and Vue 3.
---

<script setup>
import SearchableExample from '../../examples/vpick/searchable.vue'
import SearchableCode from '../../examples/vpick/searchable.vue?raw'
import ClearableExample from '../../examples/vpick/clearable.vue'
import ClearableCode from '../../examples/vpick/clearable.vue?raw'
import EmptyStatesExample from '../../examples/vpick/empty-states.vue'
import EmptyStatesCode from '../../examples/vpick/empty-states.vue?raw'
import AsyncSearchExample from '../../examples/vpick/async-search.vue'
import AsyncSearchCode from '../../examples/vpick/async-search.vue?raw'
</script>

# Search

`searchable` swaps the button trigger for an input with built-in type-ahead
filtering. The list shows everything when opened, and narrows as the user types.

<Preview :code="SearchableCode">
  <SearchableExample />
</Preview>

Every keystroke also emits `search` with the current query, if you need to react
to it.

## Clearable

`clearable` shows a clear button once a value is selected. It works in both
button and searchable modes.

<Preview :code="ClearableCode">
  <ClearableExample />
</Preview>

The clear button wipes the whole value in one go and emits only
`update:modelValue`. It does not emit `deselect`, so watch the model if you need
to react to a clear.

In searchable mode `Escape` does double duty: it closes an open list, and when
the list is already closed and `clearable` is set, it clears the selection.

## Custom matching

The built-in matcher is a substring test against the label that ignores case
and accents, so "cafe" finds "Café" and "MÜLLER" finds "Muller".
Pass `filter` to replace it. It receives each option and the current query, and
returns whether that option survives:

```vue
<script setup>
// Match on a code field as well as the label, and only from the start.
function filter(option, query) {
  const q = query.toLowerCase()
  return (
    option.label.toLowerCase().startsWith(q) ||
    String(option.raw.code).toLowerCase().startsWith(q)
  )
}
</script>

<template>
  <VPick :options="airports" searchable :filter="filter" />
</template>
```

The option handed in is Vue Pick's normalized shape, so `option.label` and
`option.value` are always there whatever your `labelKey` and `valueKey` say, and
`option.raw` is the exact object you passed in `options`. The query arrives
trimmed but with its case intact, so lowercase it yourself if you want a
case-insensitive match.

In tree mode the filter runs per node, and the branch rules are applied on top
of whatever it returns. A branch is kept when it matches or when something under
it does, so you do not have to walk children yourself.

`filter` replaces the whole matcher, `searchNested` included. If you set both,
only `filter` runs, and matching the ancestor path is then yours to implement.

## Searching other fields

The built-in search looks at the label. `searchKeys` names more fields to look
at, read straight from your option objects. The label still counts:

```vue
<VPick
  :options="people"
  label-key="name"
  value-key="id"
  :search-keys="['email', 'tags']"
  searchable
/>
```

With that, typing "bletchley" finds `{ name: "Alan Turing", email:
"alan@bletchley.uk" }`. A field can hold a string, a number, or an array of
either, such as a list of tags. Case and accents are ignored in every field, and
a tree opens the path to a node that matched on one of them.

A custom `filter` replaces the built-in search entirely, so `searchKeys` has no
effect alongside it.

## After picking

Two props decide what happens once an option is chosen.

`clearOnSelect` (default `true`) empties the search query, so the next search
starts clean rather than from the text that found the last pick.

`closeOnSelect` decides whether the list closes. Left unset it follows the mode:
`true` in single-select, `false` in `multiple`, which is what each one usually
wants. Setting it explicitly applies to both, so the prop never silently does
nothing.

```vue
<!-- Single-select that stays open, for picking through a long list -->
<VPick :options="options" searchable :close-on-select="false" />
```

## Empty states

Two different situations, two messages:

- `noOptionsText` (default `"No options available"`) when `options` is empty
- `noResultsText` (default `"No results"`) when a search matches nothing

```vue
<VPick
  :options="options"
  searchable
  no-options-text="Nothing to pick from yet"
  no-results-text="No match for that"
/>
```

The [`empty` slot](/components/vpick/slots#empty) replaces whichever applies,
and receives the current `query` so the message can quote it.

<Preview :code="EmptyStatesCode">
  <EmptyStatesExample />
</Preview>

## Searching across the ancestor path

By default a query is matched against each node's own label. `searchNested`
widens that to the node's full ancestor path:

```vue
<VPick :options="options" searchable search-nested />
```

Searching "electronics gaming" finds `Gaming` under `Electronics > Laptops`,
because every word appears somewhere in that path. Single-word queries are
unaffected, and words from unrelated branches still do not match.

Only useful in tree mode. See [Tree Select](/components/vpick/tree-select) for
how search interacts with branches and expansion.

## Searching a server

When the options live on a server, pass `fetchOptions` instead of filtering
`options` in the browser. It receives what the user typed and returns a promise
of the matching options, in the same shape as the rest:

```vue
<script setup>
async function fetchOptions(query, { signal }) {
  const res = await fetch(`/api/countries?q=${encodeURIComponent(query)}`, {
    signal,
  })
  return res.json()
}
</script>

<template>
  <VPick :options="[]" :fetch-options="fetchOptions" multiple />
</template>
```

Type a few letters. The results come back after a short delay.

<Preview :code="AsyncSearchCode">
  <AsyncSearchExample />
</Preview>

- **When it asks.** Once typing pauses for `searchDebounce` milliseconds (300 by
  default). The input is never disabled, so the user can keep typing.
- **Newer typing wins.** Starting a new query aborts the previous request through
  `signal`, and a late answer to an older query is never shown. Passing `signal`
  on to `fetch` is optional, but saves the request.
- **While waiting.** The list shows only `searchingText`, so nothing out of date
  can be picked.
- **Results** are shown as returned, with no filtering on top. `filter` does not
  apply here. Each query's answer is kept, so deleting a letter shows the earlier
  results without asking again.
- **Nothing typed.** The list shows `options`, which is a good place for recent
  or suggested picks. With `options` empty it shows `searchPromptText` instead.
- **Failure.** A rejected promise shows `searchErrorText`. Clicking it asks
  again.
- **Selections** outlive the results they came from. A picked option keeps its
  chip or label, its form value and its `select` / `deselect` payload when a
  later search no longer returns it. Put already-selected options in `options`
  so they have a label before any search runs.

**Searching in the browser.** `fetchOptions` does not have to fetch anything. It
can return the results directly instead of a promise, which is how to plug in a
search engine that runs in the page, with its own ranking. Set
`searchDebounce` to `0` so the list updates on every keystroke:

```vue
<VPick
  :options="[]"
  :fetch-options="(query) => myEngine.search(query)"
  :search-debounce="0"
/>
```

`fetchOptions` always uses the search input, even without `searchable`.

## Search with multiple

`multiple` always uses the searchable trigger, because it is the only one that
draws chips. Passing `:searchable="false"` alongside it still renders the input,
and logs a warning in development. See
[Multiselect](/components/vpick/multiselect).

## Props

<PropList group="search" />
