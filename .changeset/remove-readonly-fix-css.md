---
"vue-pick": patch
---

Remove `readonly` prop from VPickNative. Native `<select>` does not support readonly, and the workaround added complexity without matching standard UI library conventions.

Fix CSS import not working in Vue 2 projects by setting `sideEffects` to preserve CSS files during webpack tree-shaking.

Fix cursor styles for disabled and loading states.
