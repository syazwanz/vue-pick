---
"vue-pick": patch
---

Fix the `id` prop not taking effect after the component is created. The instance id was resolved once during setup, so when Vue reused a single VPick instance across sibling `v-if` branches with different ids, the trigger, listbox, and option ids all stayed frozen at whichever value rendered first. A label's `for` attribute could then activate the wrong control. The id now follows the prop, while auto-generated ids stay stable for the instance's lifetime.
