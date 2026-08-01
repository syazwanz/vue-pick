---
"vue-pick": minor
---

Add `animate`, on by default. Set it to `false` to add and remove multiselect
chips outright:

```vue
<VPick multiple :animate="false" />
```

This replaces the advice in 0.18.0 to set `--vpick-chip-transition-duration` to
`0s`. A zero duration does not switch the transition off, it runs it with no
time to run in: Vue still applies the leave class, which takes the chip out of
flow, and still performs its move pass, so the chips are left mid-reflow for a
frame. The variable is for tuning the speed while the motion is on.
