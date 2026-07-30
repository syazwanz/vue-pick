---
"vue-pick": patch
---

Stop empty-branch placeholder rows leaking into the option set.

The row shown under an expanded branch with an empty `children` array shares its parent's option, so it appeared a second time in the hidden `<select>` used for form submission, producing a duplicate `<option>` and a Vue duplicate-key warning. It also counted toward value lookups and chip ordering.

Also fixes the placeholder's `:key` in the Vue 2 build, which used a template literal. The Vue 2 template compiler truncates those in attribute expressions, so the key was malformed.
