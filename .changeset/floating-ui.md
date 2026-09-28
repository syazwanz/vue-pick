---
"vue-pick": minor
---

`floatingUi` lets Floating UI work out where the dropdown goes. Pass the library
itself:

```vue
<script setup>
import * as FloatingUI from "@floating-ui/dom"
</script>

<template>
  <VPick :options="options" :floating-ui="FloatingUI" />
</template>
```

Floating UI only works out the coordinates, using its `offset`, `flip` and
`shift` with `align` and `--vpick-listbox-offset`. VPick still decides where the
dropdown lives (`strategy`, `teleportTo`, inside scroll containers and modals),
when it repositions, and `hideWhenDetached`. Floating UI is not bundled: VPick
uses the copy you pass, and needs `@floating-ui/dom` 1.x. It is an optional peer
dependency, so it is only installed when you add it.
