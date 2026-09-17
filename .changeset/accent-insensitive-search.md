---
"vue-pick": patch
---

Built-in search now ignores accents as well as case, so typing "cafe" finds
"Café" and "muller" finds "Müller". Applies to flat lists, trees and
`searchNested`. A custom `filter` still receives the query exactly as typed.
