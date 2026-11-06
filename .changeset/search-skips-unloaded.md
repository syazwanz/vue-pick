---
"vue-pick": minor
---

Search no longer opens and loads unloaded branches. One keystroke could send a `loadChildren` request for every branch whose label matched. Unloaded branches now stay closed during a search and match by their own label; opening one by hand still loads it. Set `loadOnSearch: true` to keep the old behaviour.
