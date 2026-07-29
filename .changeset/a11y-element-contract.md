---
"vue-pick": patch
---

Make the clear control a real `<button>` in searchable and multiple modes, and pin the accessibility element contract with tests.

The searchable trigger's chevron became a native `<button>` in 0.7.0, but the clear control sitting beside it in the same container stayed a `<span role="button">`. It is now a `<button type="button">`. No `disabled` binding is needed, since `canClear` is already false whenever the control is disabled or loading, so the element simply does not render. `.vpick-clear` gained `font: inherit`, because buttons do not inherit font and the `#clear` slot can hold text.

The clear rendered inside the non-searchable `<button>` trigger deliberately stays a `<span role="button">`, because a button nested inside a button is invalid HTML. That exception is now asserted explicitly rather than left to chance.

Existing tests selected by class and asserted behavior, which passes whether a control is a `<button>` or a `<div>`. That is how the weaker markup survived unnoticed. 19 tests across both adapters now assert element identity wherever it is part of the accessibility contract: the button and input triggers and their combobox semantics, the listbox role and `aria-multiselectable`, option roles and selected state, the hidden `<select>` and its `multiple` attribute, chip remove, both clear variants, the searchable chevron, and the tree expand control staying out of the tab order.

No API change.
