---
"vue-pick": minor
---

`align` lines the dropdown up with the trigger's `start` (default) or `end`
edge, following the writing direction. `--vpick-listbox-offset` sets the gap
between trigger and dropdown, in `px`, `rem` or `em`:

```vue
<VPick :options="options" align="end" style="--vpick-listbox-offset: 0.5rem" />
```
