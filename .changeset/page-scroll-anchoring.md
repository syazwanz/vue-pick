---
"vue-pick": patch
---

The dropdown no longer trails the trigger when the page scrolls. With
`strategy="auto"`, a trigger with no scrollable ancestor now anchors to the page
instead of falling back to `position: fixed`, so its coordinates no longer
change as the page scrolls and the browser moves the panel itself.

`strategy="fixed"` is unchanged and still pins to the viewport.
