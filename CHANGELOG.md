# vue-pick

## 0.1.1

### Patch Changes

- dbef2af: Remove `readonly` prop from VPickNative. Native `<select>` does not support readonly, and the workaround added complexity without matching standard UI library conventions.

  Fix CSS import not working in Vue 2 projects by setting `sideEffects` to preserve CSS files during webpack tree-shaking.

  Fix cursor styles for disabled and loading states.

## 0.1.0

### Minor Changes

- Initial release of vue-pick with VPickNative component. Accessible native select wrapper supporting Vue 2.7 and Vue 3 with option groups, loading/error/disabled/readonly states, icon slots, and CSS custom property theming.
