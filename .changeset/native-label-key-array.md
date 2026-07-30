---
"vue-pick": patch
---

`VPickNative` now accepts `labelKey` as an array, matching `VPick`. Pass
`["label", "name"]` to use the first key with a non-empty value.

Fix: `alwaysOpen` left the chevron visible in `searchable` and `multiple` mode.
It is now hidden in every mode, as it already was in button mode.
