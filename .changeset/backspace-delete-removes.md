---
"vue-pick": minor
---

Add `backspaceRemoves` and `deleteRemoves` props, both `true` by default.

Backspace on an empty search input already removed the last chip in `multiple` mode, with no way to opt out. It can now be disabled, and Delete does the same thing.
