---
"vue-pick": patch
---

`strategy="absolute"` is now honored as given. It previously fell back to
`fixed` whenever the scroll container established no containing block, which
made it behave identically to `"auto"`. It now anchors to that container and
sets `position: relative` on it, restoring the original value on close. A
container shared by several dropdowns is reference counted.

This means `strategy="absolute"` is enough on its own; a plain
`overflow-y: auto` pane no longer needs a stylesheet change. Note the promotion
affects every absolutely-positioned descendant of the container, not just the
dropdown. `"auto"` still never mutates anything.

Fix (Vue 2 only): `teleportTo` with `strategy="absolute"` positioned the panel
with viewport coordinates while parenting it into the target, so it appeared at
the wrong offset. `teleportTo` and `strategy` are now independent in both
adapters: one decides where the panel is rendered, the other how it is
positioned there.

`"auto"` now logs a development warning naming the container it could not
anchor to, instead of silently falling back to a lagging dropdown.
