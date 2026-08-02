---
"vue-pick": minor
---

New `option-label` slot for the label on each row in the list, scoped with
`{ option, isBranch, isExpanded, depth }`. The chevron, checkbox and check icon
are left in place.

Option row spacing and branch label weight are now variables:
`--vpick-option-padding-block`, `--vpick-option-padding-inline-start`,
`--vpick-option-branch-padding-block` and `--vpick-option-branch-weight`.
Defaults are unchanged, and the branch pair falls back to the row-wide values.

Set them on the component rather than in a stylesheet. They are forwarded to the
panel, which is teleported and so out of reach of scoped CSS; a class rule would
restyle every instance on the page.

```vue
<VPick
  :options="categories"
  multiple
  disable-branch-nodes
  style="--vpick-option-branch-weight: 600"
>
  <template #option-label="{ option, isBranch }">
    <strong v-if="isBranch">{{ option.label }}</strong>
    <template v-else>{{ option.label }}</template>
  </template>
</VPick>
```
