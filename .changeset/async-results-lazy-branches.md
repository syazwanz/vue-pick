---
"vue-pick": patch
---

With both `fetchOptions` and `loadChildren`, branches in search results that
still have `children: null` now stay closed until opened. Previously every such
branch opened with the results, sending one `loadChildren` request per branch on
every search.
