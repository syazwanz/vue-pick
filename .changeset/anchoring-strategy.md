---
"vue-pick": minor
---

Add `strategy` to control how the dropdown is anchored: `"auto"` (new default),
`"absolute"` or `"fixed"`.

Fixes the dropdown visibly trailing its trigger when the page scrolls inside a
container rather than the window. Previously the panel always used
`position: fixed` in `<body>`, so its coordinates were viewport-relative and had
to be recalculated in JavaScript on every scrolled pixel, leaving it a frame
behind. Anchored inside the scroll container the coordinates no longer depend on
scroll position, so the browser moves the panel itself and it stays glued.

`"auto"` only anchors when the scrollable ancestor establishes a containing
block. A plain `overflow-y: auto` container does not, so add `position: relative`
to it to opt in. Everything else keeps the previous behavior.

When anchored, the panel flips and clamps its height against the container
instead of the window, so it is sized to fit where it actually renders. Pass
`strategy="fixed"` to keep the old behavior if you would rather the panel
overflow a short container than be clipped by it.
