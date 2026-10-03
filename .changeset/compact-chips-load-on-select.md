---
"vue-pick": minor
---

Two opt-in props for cascade trees:

- `compactChips: false` shows one chip per value entry, in `sortValueBy` order,
  instead of merging them into the topmost fully selected branch. With
  `valueConsistsOf: "ALL_WITH_INDETERMINATE"` that includes partially selected
  branches.
- `loadOnSelect: false` ticks an unloaded branch (`children: null`) as its own
  value without calling `loadChildren`. When the branch is opened later, its
  children load and replace it in the value, in the shape `valueConsistsOf`
  asks for.
