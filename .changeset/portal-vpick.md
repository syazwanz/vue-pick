---
"vue-pick": minor
---

VPick dropdown now renders in a portal (attached to `<body>`), so it escapes `overflow: hidden` ancestors and stacking contexts. Both Vue 2.7 and Vue 3 builds ship the new behavior with matching APIs.

Added:

- `teleportTo` prop — CSS selector or element to mount the dropdown into. Defaults to `<body>`.
- `bodyLock` prop — lock body scroll while the dropdown is open. Defaults to `true`. Respects iOS touch behavior and keeps internal listbox scrolling usable.

The dropdown repositions on window scroll and resize, and a visually-hidden `<select>` continues to handle form submission and validation.
