---
"vue-pick": patch
---

The dropdown now closes when the click lands on a control that stops mousedown
propagation. The outside-click listener ran on the bubble phase, so any widget
calling `stopPropagation` in its own mousedown handler swallowed the event
before it reached the document and left the panel open on top of that control.
It runs on capture now. Clicks on the trigger and inside the panel are
unaffected.
