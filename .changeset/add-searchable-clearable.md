---
"vue-pick": minor
---

Add searchable and clearable modes to VPick.

**New props:**

- `searchable` — renders an input trigger with type-ahead filtering
- `clearable` — shows a clear button when a value is selected
- `filter` — custom filter function for searchable mode
- `noResultsText` — text shown when no options match the search query

**New slots:** `#clear`, `#empty`
**New event:** `search` — emitted on every keystroke in searchable mode

**Fixes:**

- Fix dropdown flashing to bottom-right on close in Vue 3 (Teleport `:disabled` race)
- Fix double-tap zoom on mobile trigger buttons (`touch-action: manipulation`)
- Fix iOS Safari auto-zoom on searchable input focus (font-size ≥ 16px on mobile)
- Replace capture-phase window scroll listener with DOM-crawling scroll-aware repositioning
