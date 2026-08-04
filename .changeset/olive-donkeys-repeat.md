---
"vue-pick": patch
---

Fix: searching a tree no longer keeps branches with nothing matching under
them. The filter tested whether a branch was expanded, and `defaultExpandLevel`
opens branches before anything is typed, so every top-level branch survived any
query. A row now survives when it matches, or when it is on the path to
something that matches.

A branch matching on its own label is read as the whole category being asked
for, so it comes through with its subtree, matching or not. An empty branch
that matches by name shows its `noChildrenText` placeholder rather than sitting
there with nothing under it.

`flattenSearchResults` was never affected.
