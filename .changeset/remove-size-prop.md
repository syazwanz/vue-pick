---
"vue-pick": minor
---

**Breaking:** removed the `size` prop from `VPick` and `VPickNative`. Control height with the `--vpick-height-default` CSS variable instead.

The prop was misleading. `VPick` silently ignored it whenever the trigger was a combobox, which is any `searchable` or `multiple` select, so `size="sm"` did nothing in those modes with no warning. CSS variables are the honest sizing surface for a package: they compose, cascade, and can be set from anywhere in scope.

To migrate, replace `size="sm"` with the equivalent height:

```vue
<!-- before -->
<VPick v-model="selected" :options="options" size="sm" />

<!-- after -->
<VPick
  v-model="selected"
  :options="options"
  style="--vpick-height-default: 1.75rem"
/>
```

Set it on an ancestor instead of each control to apply it app-wide. The `--vpick-height-sm` variable and the `.vpick-trigger--sm` and `.vpick-native--sm` classes are gone, since nothing emits them any more.
