---
"vue-pick": patch
---

The highlight no longer jumps when list content slides under a resting pointer.
A row reports a hover in that case even though the pointer never moved, and the
list would then scroll on its own to reveal the new highlight. Only real
pointer movement moves the highlight now.

A trigger inside a `position: fixed` ancestor, such as a modal, now always
keeps `position: fixed` for the panel. The trigger stays put while things
scroll behind it, so anchoring the panel to a scroll container or to the page
only let the panel drift away, and wheeling over the panel could scroll the
container behind the modal. Passing `strategy="fixed"` for this case is no
longer needed.

This is the one case where an explicit `strategy="absolute"` does not win.
Anchoring exists to stop the panel trailing a moving trigger, and a pinned
trigger cannot trail, so `absolute` has nothing to offer there.
