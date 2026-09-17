---
title: Your server
description: Server-side search in VPick. Debounced requests, cancellation, and results in your server's ranking, from any backend.
---

<script setup>
import ServerExample from '../examples/search-engines/server.vue'
import ServerCode from '../examples/search-engines/server.vue?raw'
</script>

# Your server

This guide connects VPick to search that runs on a server: your own API, a
database's full-text search, or a hosted engine such as Meilisearch or Algolia.
Use it when the data is too big to send to the page, or changes too often.

## Demo

Search for a city or a country. The pretend server takes a moment to answer.

<Preview :code="ServerCode">
  <ServerExample />
</Preview>

## Approach

- `fetchOptions` sends the query to your server and returns a promise of the
  results.
- VPick waits for typing to pause before asking, 300 ms by default.
- A newer query cancels the older request through `signal`, and a late answer
  is never shown.
- While waiting, the list shows only a searching row, so nothing out of date can
  be picked.

## Anatomy

```vue
<script setup>
async function fetchOptions(query, { signal }) {
  const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`, {
    signal,
  })
  return res.json()
}
</script>

<template>
  <VPick
    :options="[]"
    :fetch-options="fetchOptions"
    label-key="name"
    value-key="id"
  />
</template>
```

## Setup

### Return options from your endpoint

Your endpoint takes the query and returns an array of option objects, best match
first. Any shape works: point `labelKey` and `valueKey` at its fields.

```json
[
  { "id": "kl", "name": "Kuala Lumpur" },
  { "id": "sg", "name": "Singapore" }
]
```

### Pass the signal on

`signal` aborts the request when the user keeps typing. Passing it to `fetch`
saves the network work; VPick ignores late answers either way.

### Hosted engines

A hosted engine usually has a client library. Call it inside `fetchOptions` and
return the hits:

```js
async function fetchOptions(query) {
  const { hits } = await index.search(query, { limit: 20 })
  return hits
}
```

## Tuning

- **How long to wait.** `searchDebounce` sets the pause in milliseconds. Lower
  feels quicker and sends more requests.
- **Before anything is typed.** `options` is shown with an empty query, which
  suits recent or popular picks. With `options` empty, the list shows
  `searchPromptText`.
- **Messages.** `searchingText`, `searchErrorText` and `noResultsText` change
  the rows shown while waiting, on failure, and when nothing matched.

## Failure

If the promise rejects, the list shows `searchErrorText`. Clicking it asks
again. An aborted request is not a failure and shows nothing.

## Selections

Picked options keep their chip, label and form value after a later search stops
returning them. Put already-selected options in `options` so they have a label
before any search runs.
