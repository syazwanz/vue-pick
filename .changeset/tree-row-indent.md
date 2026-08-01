---
"vue-pick": patch
---

Tree rows now indent as a unit in `multiple` mode. The checkbox previously
stayed pinned to the left edge while the chevron and label indented, leaving a
widening gap at each depth. It now sits after the expand chevron and indents
with the row. Flat multiselect is unchanged.

With `disableBranchNodes`, branch rows no longer render a checkbox. They were
showing one that could never be checked. Their label now sits where the leaf
checkboxes below it start.

`defaultExpandLevel` was read once when the component was created, so it did
nothing when `options` arrived after mount, which is what happens whenever the
tree is fetched. It now applies to branches the component has not seen before,
and a branch you expanded or collapsed by hand keeps that state when `options`
changes.

`--vpick-tree-indent` defaults to `1.375rem` instead of `1rem`, matching the
width of the chevron so a child's chevron lines up under its parent's label. Set
it explicitly to keep the old spacing:

```vue
<VPick :options="options" multiple style="--vpick-tree-indent: 1rem" />
```
