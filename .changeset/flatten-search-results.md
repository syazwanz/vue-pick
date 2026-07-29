---
"vue-pick": minor
---

Add a `flattenSearchResults` prop for tree mode.

By default, searching a tree keeps the hierarchy: matching nodes stay nested and their ancestors auto-expand so results appear in context. With `flattenSearchResults`, only nodes that match the query themselves are shown, as a flat list with no indent and no ancestors.

```vue
<VPick :options="options" searchable flatten-search-results />
```

Searching "gaming" in `Electronics > Laptops > Gaming` shows just `Gaming` instead of all three rows. A branch whose own label matches is still listed, since it is a direct match like any other.

Matching walks the whole tree rather than the currently expanded rows, so results inside collapsed branches are found. The indent is dropped because a nested match has no visible parent in this mode and would otherwise appear to float. Expansion state is left untouched while searching, since nothing needs expanding to reveal a match, and clearing the query restores the tree.
