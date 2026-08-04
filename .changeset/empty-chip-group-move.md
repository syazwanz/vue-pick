---
"vue-pick": patch
---

The search input no longer slides sideways when the dropdown opens. It shares a
transition group with the chips so it can slide as they come and go, but with no
chips it has nothing to slide alongside and any re-render while open, such as
opening itself, played a stray move. Single-select searchable never has chips,
so it happened on every open there. Chip motion in `multiple` is unchanged.
