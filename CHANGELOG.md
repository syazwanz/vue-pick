# vue-pick

## 0.5.0

### Minor Changes

- 634a2db: VPick dropdown now renders in a portal (attached to `<body>`), so it escapes `overflow: hidden` ancestors and stacking contexts. Both Vue 2.7 and Vue 3 builds ship the new behavior with matching APIs.

  Added:
  - `teleportTo` prop. CSS selector or element to mount the dropdown into. Defaults to `<body>`.
  - `bodyLock` prop. Locks body scroll while the dropdown is open. Defaults to `true`. Respects iOS touch behavior and keeps internal listbox scrolling usable.

  The dropdown repositions on window scroll and resize, and a visually-hidden `<select>` continues to handle form submission and validation.

## 0.4.0

### Minor Changes

- 4253066: Add key adapter props so you can pass any data shape directly. `VPick` and `VPickNative` now accept `labelKey`, `valueKey`, `disabledKey`, and `groupOptionsKey`; `VPick` also accepts `childrenKey` for future tree support. All props default to the existing shape (`label`/`value`/`disabled`/`options`/`children`), so existing code is unaffected.

## 0.3.0

### Minor Changes

- 41a43bf: Add `VPick` for Vue 2.7. The custom dropdown component is now available from `vue-pick/vue2` with the same API as the Vue 3 build (using `value`/`input` in place of `v-model`'s Vue 3 conventions).

  Also bundled in this release: documentation site polish (sidebar active highlight, search trigger styling, light/dark switch border, nav bar divider cleanup) and corrected README support matrix + Vue 2 import examples.

## 0.2.1

### Patch Changes

- 0d07c4c: Restructure README and clean up CSS comments

## 0.2.0

### Minor Changes

- 7586225: Add `VPick` custom dropdown component (Vue 3 only).
  - Full keyboard navigation (arrows, Home/End, type-ahead, Enter/Space/Escape)
  - Option groups with accessible labels (`role="group"` + `aria-labelledby`)
  - `separators` prop renders a divider between adjacent groups
  - `rotateIcon` prop rotates the trigger chevron when open
  - Visually hidden native `<select>` for form submission, `required` validation, and bubbling `change` events
  - `icon` and `loading` slots
  - Theming via CSS custom properties

  A Vue 2 port of `VPick` is planned for the next release. `VPickNative` remains available for both Vue 2.7 and Vue 3.

## 0.1.2

### Patch Changes

- Update README formatting and add repository metadata to package.json

## 0.1.1

### Patch Changes

- dbef2af: Remove `readonly` prop from VPickNative. Native `<select>` does not support readonly, and the workaround added complexity without matching standard UI library conventions.

  Fix CSS import not working in Vue 2 projects by setting `sideEffects` to preserve CSS files during webpack tree-shaking.

  Fix cursor styles for disabled and loading states.

## 0.1.0

### Minor Changes

- Initial release of vue-pick with VPickNative component. Accessible native select wrapper supporting Vue 2.7 and Vue 3 with option groups, loading/error/disabled/readonly states, icon slots, and CSS custom property theming.
