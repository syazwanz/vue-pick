---
"vue-pick": minor
---

New `classes` prop adds your own class to each part, such as the trigger, chips,
listbox and options. `chip` and `option` also take `(option) => string`.

```vue
<VPick :options="options" :classes="{ chip: 'my-chip', option: 'my-option' }" />
```

The trigger now has `data-state="open|closed"`, the highlighted option has
`data-highlighted`, and the multiselect checkbox has
`data-state="checked|indeterminate|unchecked"`.
