---
"vue-pick": minor
---

`floatingUi` now hands Floating UI all of the positioning, not only the
coordinates:

- `autoUpdate` keeps the dropdown in place. On top of scroll and resize, it now
  follows the trigger when it moves on its own, such as when a message appears
  above it while the dropdown is open.
- `hideWhenDetached` uses Floating UI's `hide`, which also hides the dropdown
  while its trigger is cut off by a container with `overflow: hidden`.
- `flip` runs on Floating UI's defaults, so a dropdown too wide for the room
  beside its trigger lines up with the trigger's other edge instead of sliding
  back on screen.

VPick still renders the dropdown into its container (`strategy`, `teleportTo`,
scroll containers and modals). Without `floatingUi`, nothing changes.

Upgrading: `@floating-ui/dom` 1.4 or newer is needed (the optional peer range is
now `^1.4.0`), and the whole library must be passed, since VPick now also calls
`autoUpdate` and `hide`:

```js
import * as FloatingUI from "@floating-ui/dom"
```
