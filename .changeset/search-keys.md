---
"vue-pick": minor
---

`searchKeys` makes the built-in search look at more fields than the label:

```vue
<VPick
  :options="people"
  label-key="name"
  :search-keys="['email', 'tags']"
  searchable
/>
```

Fields can hold strings, numbers, or arrays of either. Case and accents are
ignored, and trees open the path to a match. A custom `filter` still replaces
the built-in search, keys included.
