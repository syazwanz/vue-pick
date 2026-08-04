---
"vue-pick": patch
---

Fix: `valueConsistsOf="ALL_WITH_INDETERMINATE"` selected whole branches when
only part of one was picked. That mode emits a branch as soon as some
descendant is selected, but reading the value back expanded every branch entry
into all of its leaves, so ticking one leaf rendered its siblings as ticked too
and the parent showed a full check instead of a dash. The emitted value was
correct throughout; only the rendering disagreed with it.

Branch entries are now skipped when parsing an incoming value in that mode,
since the leaves are already listed individually. `ALL` and `BRANCH_PRIORITY`
are unchanged: they only emit a branch when every leaf under it is selected, so
expanding it back out is faithful.
