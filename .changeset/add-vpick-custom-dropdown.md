---
"vue-pick": minor
---

Add `VPick` custom dropdown component (Vue 3 only).

- Full keyboard navigation (arrows, Home/End, type-ahead, Enter/Space/Escape)
- Option groups with accessible labels (`role="group"` + `aria-labelledby`)
- `separators` prop renders a divider between adjacent groups
- `rotateIcon` prop rotates the trigger chevron when open
- Visually hidden native `<select>` for form submission, `required` validation, and bubbling `change` events
- `icon` and `loading` slots
- Theming via CSS custom properties

A Vue 2 port of `VPick` is planned for the next release. `VPickNative` remains available for both Vue 2.7 and Vue 3.
