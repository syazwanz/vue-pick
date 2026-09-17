---
"vue-pick": minor
---

`VPick` can search a server. Pass `fetchOptions`, which receives the typed query
and returns a promise of matching options:

```vue
<VPick
  :options="[]"
  :fetch-options="(query, { signal }) => api.search(query, { signal })"
  multiple
/>
```

- Waits for typing to pause (`searchDebounce`, default 300 ms). The input stays
  usable throughout.
- A newer query aborts the older request through `signal`, and late answers are
  ignored.
- Shows `searchingText` while waiting, `searchErrorText` (click to retry) on
  failure, and `searchPromptText` when nothing is typed and `options` is empty.
- Results are shown as returned and kept per query.
- Picked options keep their chip, label, form value and event payloads after a
  later search stops returning them.

`fetchOptions` turns the search input on, as `multiple` does.
