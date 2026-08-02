---
"vue-pick": minor
---

New `no-children-icon` slot for the placeholder under an expanded branch with no
children. The row is laid out in the same columns as the options above it, so
the icon lands on the column the leaf checkboxes use and the text stays on the
label column.

```vue
<VPick :options="options" multiple>
  <template #no-children-icon><WarningIcon /></template>
  <template #no-children="{ option }"> Nothing under {{ option.label }} </template>
</VPick>
```

Putting an icon inside `no-children` instead pushes the text one column right,
which is what this replaces. The column is held open whether or not the slot is
filled, so a text-only placeholder sits exactly where it did before.
