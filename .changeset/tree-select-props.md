---
"vue-pick": minor
---

Add `select` and `deselect` events, plus `clearOnSelect`, `closeOnSelect`, and `noChildrenText` props.

`select` and `deselect` hand back the original object you passed in `options`, not VPick's normalized copy, so custom fields survive alongside `labelKey`/`valueKey` mappings.

```vue
<VPick :options="users" label-key="name" value-key="id" @select="onSelect" />
```

`clearOnSelect` (default `true`) controls whether the search query resets after picking. `closeOnSelect` controls whether the dropdown closes; it defaults to `true` in single-select and `false` in `multiple`, and an explicit value applies to both modes.

**Behavior change:** a node with an explicit empty `children: []` array is now treated as a branch rather than a leaf. Previously it collapsed into a plain selectable option, which meant a category filtered down to zero children became selectable even with `disableBranchNodes` set. Passing `children: []` now says "this is a branch that happens to be empty"; omit the key entirely for a leaf. Expanding one shows `noChildrenText` (default `"No sub-options"`) in an inert row that arrow keys skip.

```js
{ label: "Archived", value: "archived", children: [] }  // branch, currently empty
{ label: "Archived", value: "archived" }                // leaf
```
