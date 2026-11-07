---
"vue-pick": patch
---

Fix large trees getting slow when the options come from reactive data, most of all in Vue 2. Ticking a leaf, typing in the search, selecting everything, or opening a branch could each block the page for a second or more on a tree with hundreds of rows. The tree is now built once per change to the options instead of on every read, and selected values are looked up by key instead of by scanning every row. Edits made in place to the options still update the list.
