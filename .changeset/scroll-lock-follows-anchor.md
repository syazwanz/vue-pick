---
"vue-pick": patch
---

The scroll lock no longer hides the scrollbar. It swallows wheel and touch
input aimed at the locked scroller instead, so the page's layout is never
touched: fixed headers and sidebars no longer shift when a dropdown opens or
closes, and no compensation CSS is needed. The dropdown's own list still
scrolls.

The lock also now lands on the scroll container the dropdown is anchored in
rather than always on the page, so a dropdown anchored inside a scrolling pane
freezes that pane while open.
