---
title: Fuse.js
description: Fuzzy search in VPick with Fuse.js. Typo-tolerant matching across several fields, ranked closest first.
---

<script setup>
import FuseExample from '../examples/search-engines/fuse.vue'
import FuseCode from '../examples/search-engines/fuse.vue?raw'
</script>

# Fuse.js

This guide plugs [Fuse.js](https://fusejs.io) into VPick for fuzzy search: a
misspelled query still finds its option, and the closest matches come first.

## Demo

Search for "lovlace", "hoper" or "kernel".

<Preview :code="FuseCode">
  <FuseExample />
</Preview>

## Approach

- Fuse.js runs in the page, over options you already have.
- `fetchOptions` hands the query to Fuse and returns its results in Fuse's
  order.
- `searchDebounce` is `0`, so the list updates on every keystroke.
- `options` holds the full list, shown before anything is typed.

## Anatomy

```vue
<script setup>
import Fuse from "fuse.js"

const fuse = new Fuse(people, { keys: ["name", "email"] })

function fetchOptions(query) {
  return fuse.search(query).map((result) => result.item)
}
</script>

<template>
  <VPick
    :options="people"
    :fetch-options="fetchOptions"
    :search-debounce="0"
    label-key="name"
    value-key="id"
  />
</template>
```

## Setup

### Install

```bash
npm install fuse.js
```

### Build the index

Create one `Fuse` instance for your list, outside anything that re-renders.
`keys` lists the fields to search.

```js
const fuse = new Fuse(people, {
  keys: ["name", "email"],
  threshold: 0.4,
})
```

### Connect it to VPick

Fuse returns wrapper objects. Hand VPick the original items inside them:

```js
function fetchOptions(query) {
  return fuse.search(query).map((result) => result.item)
}
```

Then pass `fetchOptions`, set `searchDebounce` to `0`, and point `labelKey` and
`valueKey` at your fields, as in the anatomy above.

## Tuning

- **How forgiving.** `threshold` runs from `0` (exact) to `1` (anything
  matches). Around `0.3` to `0.4` suits names. Higher lets more loose matches
  in, which starts to crowd the list.
- **Which fields matter most.** Give keys a weight:
  `keys: [{ name: "name", weight: 2 }, "email"]`.
- **How many results.** `fuse.search(query, { limit: 20 })` keeps long lists
  short.

## When the list changes

If `people` changes, rebuild the index with `fuse.setCollection(people)`, or
create a new `Fuse`. VPick keeps each query's results, so pass a new
`fetchOptions` function at the same time: a new function clears those results.

## Selections

Picked options keep their chip or label after a later search stops returning
them. Put already-selected people in `options` so they have a label before any
search runs.
