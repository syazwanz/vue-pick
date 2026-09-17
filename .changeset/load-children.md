---
"vue-pick": minor
---

`VPick` can fetch a branch's children when it is first opened. Mark the branch
with `children: null` and pass `loadChildren`, which receives the option and
returns a promise of its children:

```vue
<VPick
  :options="[{ label: 'Electronics', value: 'electronics', children: null }]"
  :load-children="(option) => api.children(option.value)"
  multiple
/>
```

- Loading shows a spinner and a "Loading..." row; a failed load shows a row that
  retries on click. Both texts are props: `loadingChildrenText` and
  `loadChildrenErrorText`.
- Ticking an unloaded branch loads it, and anything unloaded inside it, before
  the tick lands.
- Selected values under a branch that has not loaded are kept, submitted, and
  shown as chips with their raw value. A selected branch whose children load
  later is expanded to include them.
- Search only matches loaded options.

Without `loadChildren`, `children: null` is still a leaf.

Also changes cascade selection for everyone: a selected value that is not in
`options` is now kept when something else is ticked, instead of being dropped.
Selection without `cascade` already worked this way.
