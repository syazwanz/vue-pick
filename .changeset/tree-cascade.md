---
"vue-pick": minor
---

Add cascade selection to VPick tree mode. When `multiple` is enabled on a tree, selecting a branch now checks all its descendants automatically. An indeterminate dash appears when only some children are selected.

New VPick props: `cascade` (default `true`, set to `false` for independent selection) and `valueConsistsOf` (`"LEAF_PRIORITY"` | `"ALL"` | `"BRANCH_PRIORITY"` | `"ALL_WITH_INDETERMINATE"`, default `"LEAF_PRIORITY"`).

Chips always display in compact (branch-priority) format — selecting all of Electronics shows a single "Electronics" chip rather than one chip per leaf.
