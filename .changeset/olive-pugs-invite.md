---
"vue-pick": patch
---

Fix: removing a chip now emits `deselect`. The chip's remove button and
`Backspace`/`Delete` removal both updated the value silently, so `@deselect`
handlers never ran for those interactions. In a cascading tree it emits once
for the node removed, not once per leaf. Clearing still emits no `deselect`.

Fix: removing a chip in multiselect with `valueFormat="object"` emitted plain
values instead of the caller's objects.
