---
"vue-pick": minor
---

Add `--vpick-option-empty-icon-color`, which colors the icon in the
`no-children-icon` slot. That icon is authored in your own template but renders
inside the teleported panel, where scoped CSS cannot reach it. Set the variable
on the component and have the icon draw with `currentColor`:

```vue
<VPick :options="categories" style="--vpick-option-empty-icon-color: #f97316">
  <template #no-children-icon>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor">...</svg>
  </template>
</VPick>
```

It defaults to `inherit`, so existing icons are unchanged. Like the other row
variables it is forwarded to the panel, so setting it on one component styles
that instance rather than every VPick on the page.
