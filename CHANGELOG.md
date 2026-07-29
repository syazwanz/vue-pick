# vue-pick

## 0.14.0

### Minor Changes

- cfd307b: Add a `flattenSearchResults` prop. In tree mode, search then shows only the nodes matching the query, flat and without their ancestors.

  ```vue
  <VPick :options="options" searchable flatten-search-results />
  ```

  Searching "gaming" in `Electronics > Laptops > Gaming` shows just `Gaming`. Matches inside collapsed branches are found, and expansion state is left untouched. Default behavior is unchanged.

- 15d59e9: Add a `valueFormat` prop. Set it to `"object"` and `v-model` holds your original option objects instead of plain values.

  ```js
  // "id" (default, unchanged)
  selected = ["apple", "banana"]

  // "object"
  selected = [
    { id: "apple", label: "Apple" },
    { id: "banana", label: "Banana" },
  ]
  ```

  Objects passed back in are matched by `valueKey`, so a rebuilt literal like `{ id: "apple" }` still resolves. The hidden `<select>` used for form submission always posts plain values.

## 0.13.2

### Patch Changes

- b493b2e: Make the clear control a real `<button>` in searchable and multiple modes, and pin the accessibility element contract with tests.

  The searchable trigger's chevron became a native `<button>` in 0.7.0, but the clear control sitting beside it in the same container stayed a `<span role="button">`. It is now a `<button type="button">`. No `disabled` binding is needed, since `canClear` is already false whenever the control is disabled or loading, so the element simply does not render. `.vpick-clear` gained `font: inherit`, because buttons do not inherit font and the `#clear` slot can hold text.

  The clear rendered inside the non-searchable `<button>` trigger deliberately stays a `<span role="button">`, because a button nested inside a button is invalid HTML. That exception is now asserted explicitly rather than left to chance.

  Existing tests selected by class and asserted behavior, which passes whether a control is a `<button>` or a `<div>`. That is how the weaker markup survived unnoticed. 19 tests across both adapters now assert element identity wherever it is part of the accessibility contract: the button and input triggers and their combobox semantics, the listbox role and `aria-multiselectable`, option roles and selected state, the hidden `<select>` and its `multiple` attribute, chip remove, both clear variants, the searchable chevron, and the tree expand control staying out of the tab order.

  No API change.

## 0.13.1

### Patch Changes

- ecad93c: Fix the Vue 3 type declarations, which were being overwritten by the Vue 2 build.

  `vite.config.vue2.ts` ran `vite-plugin-dts` with `rollupTypes`, which names its rolled-up output after the entry file. Since that entry is `src/vue2/index.ts`, it emitted `dist/index.d.ts` and clobbered the Vue 3 declarations the first build had already produced correctly.

  The published `dist/index.d.ts` was therefore Vue 2's types, carrying relative imports (`'../core'`, `'../../node_modules/vue2'`) that do not resolve inside the package. With `skipLibCheck: true`, the default in most Vite and Vue setups, TypeScript reported nothing and silently gave up on the types, so `import { VPick } from "vue-pick"` came through with no checking or autocomplete at all. With `skipLibCheck: false` it surfaced as unresolved-module errors.

  The Vue 3 build already emits both `index.d.ts` and `vue2.d.ts` correctly, so the fix is to stop the Vue 2 build emitting declarations. Verified by installing the packed tarball into a clean project with Vue 3 and typechecking under `strict` with `skipLibCheck: false`.

  `vue-pick/vue2` was unaffected.

## 0.13.0

### Minor Changes

- 044d2da: Add a `sortValueBy` prop and a `value-label` slot.

  **`sortValueBy`** controls the order of the emitted array and the chips in `multiple` mode. Defaults to `"ORDER_SELECTED"`, which keeps the order options were picked in, so existing behavior is unchanged.

  | Value                        | Order                                           |
  | ---------------------------- | ----------------------------------------------- |
  | `"ORDER_SELECTED"` (default) | The order the user picked them                  |
  | `"INDEX"`                    | Position in the tree, top to bottom as rendered |
  | `"LEVEL"`                    | Shallowest first, ties broken by position       |

  It applies to the display as well as the emitted value, so an array handed in unsorted still renders in order.

  **`value-label` slot** replaces the trigger label in single mode and each chip in `multiple` mode. It receives `{ option }`, including `option.raw`, the exact object you passed in `options`:

  ```vue
  <VPick v-model="selected" :options="users" label-key="name" value-key="id">
    <template #value-label="{ option }">
      {{ option.raw.nickname || option.label }}
    </template>
  </VPick>
  ```

  This covers display labels that are derived rather than read from a single field, which `labelKey` cannot express.

## 0.12.0

### Minor Changes

- ad3bac3: Add `vpick-option--branch` / `vpick-option--leaf` classes and a `data-depth` attribute to tree option rows, a `no-children` slot, and make unselectable branch rows toggle expansion when clicked.

  **Styling branch rows.** Telling a branch apart from a leaf previously needed a custom option renderer. Each row in tree mode now carries a modifier class and its nesting depth, so it is a CSS concern:

  ```css
  .vpick-option--branch {
    font-weight: 600;
  }
  .vpick-option--branch[data-depth="0"] {
    text-transform: uppercase;
  }
  ```

  `--branch` applies whenever the node has a `children` array, empty or not. `--leaf` and `data-depth` apply only in tree mode, so flat lists are unchanged.

  **`no-children` slot.** `noChildrenText` takes a string, so it could not carry an icon or any other markup. The new slot receives the branch as `{ option }` and falls back to the prop.

  ```vue
  <template #no-children="{ option }">
    <WarningIcon /> Nothing under {{ option.label }}
  </template>
  ```

  **Behavior change:** with `disableBranchNodes`, clicking a branch row now toggles the branch open or closed. Previously the click did nothing at all, leaving only the chevron as a target. Those rows also no longer receive `vpick-option--disabled`, since a row that responds to clicks should not be painted as dead, and they can now be hovered and highlighted. They keep `aria-disabled="true"`, which correctly reports that they are not selectable as options.

## 0.11.0

### Minor Changes

- 5bcc3ed: Add `select` and `deselect` events, plus `clearOnSelect`, `closeOnSelect`, and `noChildrenText` props.

  `select` and `deselect` hand back the original object you passed in `options`, not VPick's normalized copy, so custom fields survive alongside `labelKey`/`valueKey` mappings.

  ```vue
  <VPick :options="users" label-key="name" value-key="id" @select="onSelect" />
  ```

  `clearOnSelect` (default `true`) controls whether the search query resets after picking. `closeOnSelect` controls whether the dropdown closes; it defaults to `true` in single-select and `false` in `multiple`, and an explicit value applies to both modes.

  **Behavior change:** a node with an explicit empty `children: []` array is now treated as a branch rather than a leaf. Previously it collapsed into a plain selectable option, which meant a category filtered down to zero children became selectable even with `disableBranchNodes` set. Passing `children: []` now says "this is a branch that happens to be empty"; omit the key entirely for a leaf. Expanding one shows `noChildrenText` (default `"No sub-options"`) in an inert row that arrow keys skip.

  ```js
  { label: "Archived", value: "archived", children: [] }  // branch, currently empty
  { label: "Archived", value: "archived" }                // leaf
  ```

## 0.10.0

### Minor Changes

- 9f37b68: **Breaking:** removed the `size` prop from `VPick` and `VPickNative`. Control height with the `--vpick-height-default` CSS variable instead.

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

## 0.9.2

### Patch Changes

- b9edbe1: Fix the `id` prop not taking effect after the component is created. The instance id was resolved once during setup, so when Vue reused a single VPick instance across sibling `v-if` branches with different ids, the trigger, listbox, and option ids all stayed frozen at whichever value rendered first. A label's `for` attribute could then activate the wrong control. The id now follows the prop, while auto-generated ids stay stable for the instance's lifetime.

## 0.9.1

### Patch Changes

- ccec30d: Fix dropdown jitter during page scroll. The listbox is now wrapped in a hardware-accelerated positioner that uses `transform: translate3d` for tracking, so the browser composites position updates on the GPU instead of repainting top/left on every frame. Visible improvement in apps with many reactive watchers where Vue's microtask queue lags scroll repaint.

## 0.9.0

### Minor Changes

- da95088: Add cascade selection to VPick tree mode. When `multiple` is enabled on a tree, selecting a branch now checks all its descendants automatically. An indeterminate dash appears when only some children are selected.

  New VPick props: `cascade` (default `true`, set to `false` for independent selection) and `valueConsistsOf` (`"LEAF_PRIORITY"` | `"ALL"` | `"BRANCH_PRIORITY"` | `"ALL_WITH_INDETERMINATE"`, default `"LEAF_PRIORITY"`).

  Chips always display in compact (branch-priority) format — selecting all of Electronics shows a single "Electronics" chip rather than one chip per leaf.

## 0.8.0

### Minor Changes

- 3ccf3e5: Add tree select to VPick. Pass options with a `children` array and tree mode activates automatically — no extra prop needed. Clicking the chevron expands or collapses a branch; clicking the row selects the node.

  New VPick props: `childrenKey` (default `"children"`), `defaultExpandLevel`, `disableBranchNodes`.

  Tree mode works with `searchable` (matching nodes auto-expand their ancestors) and `multiple` (independent node selection; cascade is planned for a future release).

## 0.7.0

### Minor Changes

- 60ad553: Add multiple selection to VPick.

  **New prop:**
  - `multiple` — allows selecting more than one option. `v-model` becomes an array, selected values render as removable chips, and the dropdown stays open after each pick. Pressing `Backspace` while the search input is empty removes the last chip. The hidden native `<select multiple>` participates in form submission with all selected values.

  `multiple` always renders the searchable trigger so chips and the input share one row. Combine with `clearable` to expose a single button that empties the array.

## 0.6.0

### Minor Changes

- f94265a: Add searchable and clearable modes to VPick.

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
