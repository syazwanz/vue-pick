---
"vue-pick": minor
---

In single-select the row holding the current value is now tinted, so it can be
found at a glance rather than by looking for the check icon. It outranks the
hover and keyboard highlight, so a selected row keeps its tint while hovered.
`multiple` is unchanged, since the checkboxes already carry that meaning.

Consecutive rows also gain a small gap, `--vpick-option-gap` (default
`0.125rem`), so backgrounds no longer merge into one block as the highlight
moves between rows. Set it to `0` for a continuous list.

Two further variables control the tint, all of them forwarded so they can be set
on a single component: `--vpick-option-selected-bg` (default `#e3f2fd`) and
`--vpick-option-selected-weight` (default `inherit`, since bold text is wider
and would nudge the row's label).

```vue
<VPick
  :options="options"
  style="--vpick-option-selected-bg: #f4f4f5; --vpick-option-selected-weight: 600"
/>
```

Set `--vpick-option-selected-bg: transparent` to restore the previous
appearance.
