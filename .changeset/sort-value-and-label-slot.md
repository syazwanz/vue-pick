---
"vue-pick": minor
---

Add a `sortValueBy` prop and a `value-label` slot.

**`sortValueBy`** controls the order of the emitted array and the chips in `multiple` mode. Defaults to `"ORDER_SELECTED"`, which keeps the order options were picked in, so existing behavior is unchanged.

| Value                        | Order                                           |
| ---------------------------- | ----------------------------------------------- |
| `"ORDER_SELECTED"` (default) | The order the user picked them                  |
| `"INDEX"`                    | Position in the tree, top to bottom as rendered |
| `"LEVEL"`                    | Shallowest first, ties broken by position       |

It applies to the display as well as the emitted value, so an array handed in unsorted still renders in order.

**`value-label` slot** replaces the trigger label in single mode and each chip in `multiple` mode. It receives `{ option }`, including `option.raw`, the exact object you passed in `options`:

```vue
<VPick v-model="selected" :options="users" label-key="name" value-key="id">
  <template #value-label="{ option }">
    {{ option.raw.nickname || option.label }}
  </template>
</VPick>
```

This covers display labels that are derived rather than read from a single field, which `labelKey` cannot express.
