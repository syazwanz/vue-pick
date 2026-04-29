---
"vue-pick": minor
---

Add tree select to VPick. Pass options with a `children` array and tree mode activates automatically — no extra prop needed. Clicking the chevron expands or collapses a branch; clicking the row selects the node.

New VPick props: `childrenKey` (default `"children"`), `defaultExpandLevel`, `disableBranchNodes`.

Tree mode works with `searchable` (matching nodes auto-expand their ancestors) and `multiple` (independent node selection; cascade is planned for a future release).
