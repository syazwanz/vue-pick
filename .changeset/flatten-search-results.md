---
"vue-pick": minor
---

Add a `flattenSearchResults` prop. In tree mode, search then shows only the nodes matching the query, flat and without their ancestors.

```vue
<VPick :options="options" searchable flatten-search-results />
```

Searching "gaming" in `Electronics > Laptops > Gaming` shows just `Gaming`. Matches inside collapsed branches are found, and expansion state is left untouched. Default behavior is unchanged.
