---
"vue-pick": minor
---

New `optionAttrs` prop adds your own attributes to each option row, such as a
test id:

```vue
<VPick :options="options" :option-attrs="(o) => ({ 'data-testid': o.value })" />
```

`class` and `style` merge with the row's own. Core attributes (`id`, `role`,
`tabindex`, `data-value`, `data-depth`, `aria-*`, `on*`) are ignored.
