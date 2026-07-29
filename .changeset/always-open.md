---
"vue-pick": minor
---

Add an `alwaysOpen` prop. The list renders permanently in the page instead of as a dropdown, and cannot be closed.

```vue
<VPick v-model="selected" :options="options" always-open multiple />
```

Useful inside a filter panel where the list is the content rather than something to reveal. The panel is laid out in normal flow, so it is not teleported, not positioned, and does not lock body scroll. The chevron is hidden and the root gains a `vpick--inline` class for styling. Search, selection and keyboard navigation are unchanged. A disabled control still closes.
