---
"vue-pick": minor
---

Multiselect chips now animate. A chip scales up as it is added and shrinks away
as it is removed, the remaining chips slide across to close the gap, and the
search input slides with them. Removing the last chip is instant.

```vue
<VPick multiple style="--vpick-chip-transition-duration: 0s" />
```

Set that to `0s` anywhere in scope to turn the motion off.

Fix: the multiselect placeholder shifted sideways whenever the first chip
appeared or the last one was removed, and sat further in than the single-select
one. Both now line up and stay put.

Every transition now honours `prefers-reduced-motion: reduce`, including the
dropdown, which previously ignored it. The loading spinner still turns, since it
reports progress.

The theming guide now documents the twelve chip, clear-button and empty-state
variables it was missing.
