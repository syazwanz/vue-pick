---
"vue-pick": patch
---

Reposition the dropdown once per animation frame instead of once per scroll
event, and stop re-reading the 24 forwarded CSS variables while scrolling. In a
page whose scroll container is not the window, a scroll went from 6 style
resolves and 6 position writes across 6 frames to 0 and 6.

This reduces the cost of tracking but does not eliminate the lag: with
`position: fixed` the panel's coordinates are computed in JavaScript, so it
still trails a scroll the browser composites off the main thread. Anchoring
inside the scroll container is the actual fix and is coming separately.
