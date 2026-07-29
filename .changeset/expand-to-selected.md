---
"vue-pick": patch
---

Reveal the current selection when a tree dropdown opens. Collapsed ancestors of the selected node are now expanded, so the row can be highlighted and scrolled to.

Previously a selection nested inside a collapsed branch was invisible on open: the tree appeared to have nothing selected, and the usual scroll-to-selection had no row to scroll to.

Nothing changes when there is no selection, when the selection is already visible, or for flat lists.
