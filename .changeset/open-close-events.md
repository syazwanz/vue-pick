---
"vue-pick": minor
---

`VPick` now emits `open` and `close` when its list opens and closes. Neither
carries a payload.

```vue
<VPick :options="options" @open="onOpen" @close="onClose" />
```

They fire only on a real change, so closing a list that is already closed emits
nothing. An `alwaysOpen` list starts open, so it emits no `open` on mount; it
emits `close` if it is disabled and `open` again when re-enabled.
