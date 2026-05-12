---
"vue-pick": patch
---

Fix dropdown jitter during page scroll. The listbox is now wrapped in a hardware-accelerated positioner that uses `transform: translate3d` for tracking, so the browser composites position updates on the GPU instead of repainting top/left on every frame. Visible improvement in apps with many reactive watchers where Vue's microtask queue lags scroll repaint.
