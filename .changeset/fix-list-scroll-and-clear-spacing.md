---
"vue-pick": patch
---

Fix three list and trigger issues:

- Opening a long list now lands on the selected option, even when long labels wrap.
- Keyboard scrolling keeps the list's padding around the highlighted option, so its rounded corners are no longer clipped at the top or bottom edge.
- In multi-select, the clear button's hover background no longer overlaps the chips.
