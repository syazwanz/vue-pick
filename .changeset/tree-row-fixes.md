---
"vue-pick": patch
---

Chips no longer collapse into a branch that cannot be selected. With
`disableBranchNodes`, picking every leaf of a branch by hand rendered one chip
named after that branch while the bound value still held the individual leaves.
The compact display is unchanged where the branch is selectable.

Leaf rows no longer over-indent under `disableBranchNodes`. Branch rows stopped
carrying a checkbox in 0.19.1, which left every leaf one slot wider than the
branch above it. A leaf's checkbox now sits in the chevron column, so a child
lines up under the first letter of its parent's label.

Enter animations now run in the Vue 2 build. Vue 2 names the starting class
`-enter` where Vue 3 names it `-enter-from`, so chips and the dropdown panel
were appearing with no starting state.
