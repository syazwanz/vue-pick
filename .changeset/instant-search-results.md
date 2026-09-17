---
"vue-pick": minor
---

`fetchOptions` can return results directly instead of a promise, so a search
engine that runs in the page plugs in the same way a server does, with its own
ranking kept. With `searchDebounce: 0`, results now appear on the keystroke
itself:

```vue
<VPick
  :options="[]"
  :fetch-options="(query) => myEngine.search(query)"
  :search-debounce="0"
/>
```
