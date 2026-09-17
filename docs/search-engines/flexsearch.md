---
title: FlexSearch
description: Full-text search in VPick with FlexSearch. Several fields, partial words and relevance ranking, all in the browser.
---

<script setup>
import FlexSearchExample from '../examples/search-engines/flexsearch.vue'
import FlexSearchCode from '../examples/search-engines/flexsearch.vue?raw'
</script>

# FlexSearch

This guide plugs [FlexSearch](https://github.com/nextapps-de/flexsearch) into
VPick for full-text search: queries match words across several fields, the
start of a word is enough, and options matching in more fields rank higher.

## Demo

Search for "run", "trail" or "shoes rough".

<Preview :code="FlexSearchCode">
  <FlexSearchExample />
</Preview>

## Approach

- FlexSearch builds an index in the page over the fields you choose.
- `fetchOptions` runs the query against the index and returns the matching
  options in relevance order.
- `searchDebounce` is `0`, so results follow every keystroke.
- `options` holds the full list, shown before anything is typed.

## Anatomy

```vue
<script setup>
import { Document } from "flexsearch"

const index = new Document({
  document: { id: "id", index: ["title", "description"], store: true },
  tokenize: "forward",
})
for (const product of products) index.add(product)

function fetchOptions(query) {
  return index
    .search(query, { merge: true, enrich: true, suggest: true })
    .map((result) => result.doc)
}
</script>

<template>
  <VPick
    :options="products"
    :fetch-options="fetchOptions"
    :search-debounce="0"
    label-key="title"
    value-key="id"
  />
</template>
```

## Setup

### Install

```bash
npm install flexsearch
```

### Build the index

A `Document` index searches objects. Name the id field, the fields to index,
and `store: true` so results carry the whole record. Then add your records.

```js
import { Document } from "flexsearch"

const index = new Document({
  document: { id: "id", index: ["title", "description"], store: true },
  tokenize: "forward",
})
for (const product of products) index.add(product)
```

### Connect it to VPick

`merge: true` combines the matches from every field into one ranked list,
`enrich: true` attaches the stored record to each, and `suggest: true` keeps
options that match only some of the words, ranked below the ones that match
more. Hand VPick the records:

```js
function fetchOptions(query) {
  return index
    .search(query, { merge: true, enrich: true, suggest: true })
    .map((result) => result.doc)
}
```

## Tuning

- **Partial words.** `tokenize` decides what counts as a match. `"forward"`
  matches the start of a word, so "run" finds "running". `"full"` matches
  anywhere inside a word, at the cost of a bigger index. `"strict"` matches
  whole words only.
- **Spelling and accents.** `encoder` sets how text is normalised before it is
  indexed. FlexSearch ships presets, such as `Charset.LatinBalance`, which is
  looser than the default.
- **How many results.** Add `limit: 20` to the search options to keep long
  lists short.

## When the list changes

Keep the index in step with `index.add()`, `index.update()` and
`index.remove(id)`. VPick keeps each query's results, so pass a new
`fetchOptions` function when the data changes: a new function clears those
results.

## Selections

Picked options keep their chip or label after a later search stops returning
them. Put already-selected records in `options` so they have a label before any
search runs.
