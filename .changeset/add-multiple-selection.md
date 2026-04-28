---
"vue-pick": minor
---

Add multiple selection to VPick.

**New prop:**

- `multiple` — allows selecting more than one option. `v-model` becomes an array, selected values render as removable chips, and the dropdown stays open after each pick. Pressing `Backspace` while the search input is empty removes the last chip. The hidden native `<select multiple>` participates in form submission with all selected values.

`multiple` always renders the searchable trigger so chips and the input share one row. Combine with `clearable` to expose a single button that empties the array.
