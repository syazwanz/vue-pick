---
"vue-pick": patch
---

Fix the browser's default focus ring showing on the non-searchable trigger
instead of the themed one. A host stylesheet with a `button:focus` rule
outranked the reset on `.vpick-trigger`, so the native ring painted over ours.
Searchable and multiple were unaffected, since their trigger is not a `<button>`.
