---
"vue-pick": minor
---

Add a `noOptionsText` prop, and show a message when there are no options at all.

Previously the empty message only appeared while searching, so an empty `options` array opened a completely blank panel with no text.

`noOptionsText` (default `"No options available"`) covers "there is nothing to pick from"; `noResultsText` still covers "your search matched nothing". The `empty` slot receives whichever applies.
