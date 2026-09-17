---
"vue-pick": minor
---

`floatingUi` positions the dropdown with Floating UI instead of the built-in
positioning. Pass the library itself:

```vue
<script setup>
import * as FloatingUI from "@floating-ui/dom"
</script>

<template>
  <VPick :options="options" :floating-ui="FloatingUI" />
</template>
```

VPick still decides when to reposition and applies `align` and
`--vpick-listbox-offset`, using Floating UI's `offset`, `flip` and `shift`.
While it is set, the built-in anchoring inside scroll containers and
`hideWhenDetached` do not apply. Floating UI is not bundled: VPick uses the copy
you pass.
