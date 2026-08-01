---
"vue-pick": minor
---

Add `hideWhenDetached`, on by default. An open dropdown whose trigger has been
scrolled out of view, or out of its scroll container, is now hidden until the
trigger comes back rather than left floating over unrelated content.

```vue
<VPick :options="options" :hide-when-detached="false" />
```

It is hidden, not closed, so the selection, focus position and search query all
survive.

This measures clipping, not overlap: a trigger covered by a fixed header is not
clipped by anything, so the panel stays visible there. Lower
`--vpick-listbox-z-index` below your header to have it slide underneath instead.
