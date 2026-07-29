---
"vue-pick": patch
---

Close the dropdown when the control becomes disabled or starts loading, and ignore selections while it is.

An open dropdown previously stayed open after `disabled` was set. Its options remained clickable and still emitted `update:modelValue`, while the trigger could no longer be used to close it.
