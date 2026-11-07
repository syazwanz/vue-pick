---
"vue-pick": patch
---

Fix search still loading unloaded branches that sit inside a loaded branch whose label matches the query. Those branches now stay closed too, still listed under it, unless `loadOnSearch` is `true`.

Fix `flattenSearchResults` showing a "Loading..." row under each matching unloaded branch that never finished, since nothing loaded it.
