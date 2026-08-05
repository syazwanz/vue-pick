---
"vue-pick": patch
---

Fix: `flattenSearchResults` dropped the subtree that a matching branch brings
with it. Searching a branch by name returned that one row and nothing under it,
which left nothing to pick when the branch was not selectable. An empty branch
matching by name also lost its `noChildrenText` placeholder.

Flattened results are now the same rows as nested results, in document order,
minus the ancestors and the indentation. Searching a leaf is unchanged: its
ancestor branches are still left out.
