---
"vue-pick": minor
---

Add key adapter props so you can pass any data shape directly. `VPick` and `VPickNative` now accept `labelKey`, `valueKey`, `disabledKey`, and `groupOptionsKey`; `VPick` also accepts `childrenKey` for future tree support. All props default to the existing shape (`label`/`value`/`disabled`/`options`/`children`), so existing code is unaffected.
