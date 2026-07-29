---
"vue-pick": minor
---

Add `vpick-option--branch` / `vpick-option--leaf` classes and a `data-depth` attribute to tree option rows, a `no-children` slot, and make unselectable branch rows toggle expansion when clicked.

**Styling branch rows.** Telling a branch apart from a leaf previously needed a custom option renderer. Each row in tree mode now carries a modifier class and its nesting depth, so it is a CSS concern:

```css
.vpick-option--branch {
  font-weight: 600;
}
.vpick-option--branch[data-depth="0"] {
  text-transform: uppercase;
}
```

`--branch` applies whenever the node has a `children` array, empty or not. `--leaf` and `data-depth` apply only in tree mode, so flat lists are unchanged.

**`no-children` slot.** `noChildrenText` takes a string, so it could not carry an icon or any other markup. The new slot receives the branch as `{ option }` and falls back to the prop.

```vue
<template #no-children="{ option }">
  <WarningIcon /> Nothing under {{ option.label }}
</template>
```

**Behavior change:** with `disableBranchNodes`, clicking a branch row now toggles the branch open or closed. Previously the click did nothing at all, leaving only the chevron as a target. Those rows also no longer receive `vpick-option--disabled`, since a row that responds to clicks should not be painted as dead, and they can now be hovered and highlighted. They keep `aria-disabled="true"`, which correctly reports that they are not selectable as options.
