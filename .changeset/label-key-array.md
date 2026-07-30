---
"vue-pick": minor
---

`labelKey` now accepts an array as a fallback chain. The first key with a non-empty value wins.

```vue
<VPick :options="options" :label-key="['label', 'name']" value-key="id" />
```

Useful when records are inconsistent, e.g. some carry `label` and others `name`. A single string behaves exactly as before.

The resolved label is used for search matching as well as display.
