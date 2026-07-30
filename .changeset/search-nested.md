---
"vue-pick": minor
---

Add a `searchNested` prop for tree mode. A multi-word query can then match across a node's ancestor path.

```vue
<VPick :options="options" searchable search-nested />
```

Searching "electronics gaming" finds `Gaming` under `Electronics > Laptops`, because every word appears somewhere in that path. Single-word queries are unaffected, and words from unrelated branches still do not match.
