---
"vue-pick": minor
---

`VPick` exposes a `focus()` method, reachable through a template ref.

```vue
<VPick ref="pick" :options="options" />
<button @click="$refs.pick.focus()">Edit</button>
```

In searchable and `multiple` mode, focusing opens the list, the same as tabbing
into the control.
