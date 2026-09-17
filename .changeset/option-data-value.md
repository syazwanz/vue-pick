---
"vue-pick": minor
---

Every `VPick` option row now carries its value as `data-value`, so one specific
option can be styled without a slot:

```css
.vpick-option[data-value="all"] .vpick-option-expand {
  visibility: hidden;
}
```

Set for string, number and boolean values only.
