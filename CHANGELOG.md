# vue-pick

## 0.21.0

### Minor Changes

- 1947971: New `no-children-icon` slot for the placeholder under an expanded branch with no
  children. The row is laid out in the same columns as the options above it, so
  the icon lands on the column the leaf checkboxes use and the text stays on the
  label column.

  ```vue
  <VPick :options="options" multiple>
    <template #no-children-icon><WarningIcon /></template>
    <template #no-children="{ option }"> Nothing under {{ option.label }} </template>
  </VPick>
  ```

  Putting an icon inside `no-children` instead pushes the text one column right,
  which is what this replaces. The column is held open whether or not the slot is
  filled, so a text-only placeholder sits exactly where it did before.

### Patch Changes

- 4824b77: The dropdown now closes when the click lands on a control that stops mousedown
  propagation. The outside-click listener ran on the bubble phase, so any widget
  calling `stopPropagation` in its own mousedown handler swallowed the event
  before it reached the document and left the panel open on top of that control.
  It runs on capture now. Clicks on the trigger and inside the panel are
  unaffected.
- 13bb028: The dropdown no longer trails the trigger when the page scrolls. With
  `strategy="auto"`, a trigger with no scrollable ancestor now anchors to the page
  instead of falling back to `position: fixed`, so its coordinates no longer
  change as the page scrolls and the browser moves the panel itself.

  `strategy="fixed"` is unchanged and still pins to the viewport.

## 0.20.0

### Minor Changes

- 0f5e176: New `option-label` slot for the label on each row in the list, scoped with
  `{ option, isBranch, isExpanded, depth }`. The chevron, checkbox and check icon
  are left in place.

  Option row spacing and branch label weight are now variables:
  `--vpick-option-padding-block`, `--vpick-option-padding-inline-start`,
  `--vpick-option-branch-padding-block` and `--vpick-option-branch-weight`.
  Defaults are unchanged, and the branch pair falls back to the row-wide values.

  Set them on the component rather than in a stylesheet. They are forwarded to the
  panel, which is teleported and so out of reach of scoped CSS; a class rule would
  restyle every instance on the page.

  ```vue
  <VPick
    :options="categories"
    multiple
    disable-branch-nodes
    style="--vpick-option-branch-weight: 600"
  >
    <template #option-label="{ option, isBranch }">
      <strong v-if="isBranch">{{ option.label }}</strong>
      <template v-else>{{ option.label }}</template>
    </template>
  </VPick>
  ```

### Patch Changes

- 0f5e176: Chips no longer collapse into a branch that cannot be selected. With
  `disableBranchNodes`, picking every leaf of a branch by hand rendered one chip
  named after that branch while the bound value still held the individual leaves.
  The compact display is unchanged where the branch is selectable.

  Leaf rows no longer over-indent under `disableBranchNodes`. Branch rows stopped
  carrying a checkbox in 0.19.1, which left every leaf one slot wider than the
  branch above it. A leaf's checkbox now sits in the chevron column, so a child
  lines up under the first letter of its parent's label.

  Enter animations now run in the Vue 2 build. Vue 2 names the starting class
  `-enter` where Vue 3 names it `-enter-from`, so chips and the dropdown panel
  were appearing with no starting state.

## 0.19.1

### Patch Changes

- 132d812: Tree rows now indent as a unit in `multiple` mode. The checkbox previously
  stayed pinned to the left edge while the chevron and label indented, leaving a
  widening gap at each depth. It now sits after the expand chevron and indents
  with the row. Flat multiselect is unchanged.

  With `disableBranchNodes`, branch rows no longer render a checkbox. They were
  showing one that could never be checked. Their label now sits where the leaf
  checkboxes below it start.

  `defaultExpandLevel` was read once when the component was created, so it did
  nothing when `options` arrived after mount, which is what happens whenever the
  tree is fetched. It now applies to branches the component has not seen before,
  and a branch you expanded or collapsed by hand keeps that state when `options`
  changes.

  `--vpick-tree-indent` defaults to `1.375rem` instead of `1rem`, matching the
  width of the chevron so a child's chevron lines up under its parent's label. Set
  it explicitly to keep the old spacing:

  ```vue
  <VPick :options="options" multiple style="--vpick-tree-indent: 1rem" />
  ```

## 0.19.0

### Minor Changes

- 480e450: Add `animate`, on by default. Set it to `false` to add and remove multiselect
  chips outright:

  ```vue
  <VPick multiple :animate="false" />
  ```

  This replaces the advice in 0.18.0 to set `--vpick-chip-transition-duration` to
  `0s`. A zero duration does not switch the transition off, it runs it with no
  time to run in: Vue still applies the leave class, which takes the chip out of
  flow, and still performs its move pass, so the chips are left mid-reflow for a
  frame. The variable is for tuning the speed while the motion is on.

- 480e450: Add `hideWhenDetached`, on by default. An open dropdown whose trigger has been
  scrolled out of view, or out of its scroll container, is now hidden until the
  trigger comes back rather than left floating over unrelated content.

  ```vue
  <VPick :options="options" :hide-when-detached="false" />
  ```

  It is hidden, not closed, so the selection, focus position and search query all
  survive.

  This measures clipping, not overlap: a trigger covered by a fixed header is not
  clipped by anything, so the panel stays visible there. Lower
  `--vpick-listbox-z-index` below your header to have it slide underneath instead.

### Patch Changes

- 480e450: Fix the browser's default focus ring showing on the non-searchable trigger
  instead of the themed one. A host stylesheet with a `button:focus` rule
  outranked the reset on `.vpick-trigger`, so the native ring painted over ours.
  Searchable and multiple were unaffected, since their trigger is not a `<button>`.

## 0.18.0

### Minor Changes

- 5f1f430: Multiselect chips now animate. A chip scales up as it is added and shrinks away
  as it is removed, the remaining chips slide across to close the gap, and the
  search input slides with them. Removing the last chip is instant.

  ```vue
  <VPick multiple style="--vpick-chip-transition-duration: 0s" />
  ```

  Set that to `0s` anywhere in scope to turn the motion off.

  Fix: the multiselect placeholder shifted sideways whenever the first chip
  appeared or the last one was removed, and sat further in than the single-select
  one. Both now line up and stay put.

  Every transition now honours `prefers-reduced-motion: reduce`, including the
  dropdown, which previously ignored it. The loading spinner still turns, since it
  reports progress.

  The theming guide now documents the twelve chip, clear-button and empty-state
  variables it was missing.

## 0.17.1

### Patch Changes

- 0255594: `strategy="absolute"` is now honored as given. It previously fell back to
  `fixed` whenever the scroll container established no containing block, which
  made it behave identically to `"auto"`. It now anchors to that container and
  sets `position: relative` on it, restoring the original value on close. A
  container shared by several dropdowns is reference counted.

  This means `strategy="absolute"` is enough on its own; a plain
  `overflow-y: auto` pane no longer needs a stylesheet change. Note the promotion
  affects every absolutely-positioned descendant of the container, not just the
  dropdown. `"auto"` still never mutates anything.

  Fix (Vue 2 only): `teleportTo` with `strategy="absolute"` positioned the panel
  with viewport coordinates while parenting it into the target, so it appeared at
  the wrong offset. `teleportTo` and `strategy` are now independent in both
  adapters: one decides where the panel is rendered, the other how it is
  positioned there.

  `"auto"` now logs a development warning naming the container it could not
  anchor to, instead of silently falling back to a lagging dropdown.

## 0.17.0

### Minor Changes

- 9d48524: Add `strategy` to control how the dropdown is anchored: `"auto"` (new default),
  `"absolute"` or `"fixed"`.

  Fixes the dropdown visibly trailing its trigger when the page scrolls inside a
  container rather than the window. Previously the panel always used
  `position: fixed` in `<body>`, so its coordinates were viewport-relative and had
  to be recalculated in JavaScript on every scrolled pixel, leaving it a frame
  behind. Anchored inside the scroll container the coordinates no longer depend on
  scroll position, so the browser moves the panel itself and it stays glued.

  `"auto"` only anchors when the scrollable ancestor establishes a containing
  block. A plain `overflow-y: auto` container does not, so add `position: relative`
  to it to opt in. Everything else keeps the previous behavior.

  When anchored, the panel flips and clamps its height against the container
  instead of the window, so it is sized to fit where it actually renders. Pass
  `strategy="fixed"` to keep the old behavior if you would rather the panel
  overflow a short container than be clipped by it.

## 0.16.3

### Patch Changes

- e6a444b: Reposition the dropdown once per animation frame instead of once per scroll
  event, and stop re-reading the 24 forwarded CSS variables while scrolling. In a
  page whose scroll container is not the window, a scroll went from 6 style
  resolves and 6 position writes across 6 frames to 0 and 6.

  This reduces the cost of tracking but does not eliminate the lag: with
  `position: fixed` the panel's coordinates are computed in JavaScript, so it
  still trails a scroll the browser composites off the main thread. Anchoring
  inside the scroll container is the actual fix and is coming separately.

## 0.16.2

### Patch Changes

- 501bc1c: `VPickNative` now accepts `labelKey` as an array, matching `VPick`. Pass
  `["label", "name"]` to use the first key with a non-empty value.

  Fix: `alwaysOpen` left the chevron visible in `searchable` and `multiple` mode.
  It is now hidden in every mode, as it already was in button mode.

## 0.16.1

### Patch Changes

- fe67cf8: Update the package description and keywords to cover multiselect and tree select.

## 0.16.0

### Minor Changes

- 3a17616: Add `backspaceRemoves` and `deleteRemoves` props, both `true` by default.

  Backspace on an empty search input already removed the last chip in `multiple` mode, with no way to opt out. It can now be disabled, and Delete does the same thing.

- 3a17616: `labelKey` now accepts an array as a fallback chain. The first key with a non-empty value wins.

  ```vue
  <VPick :options="options" :label-key="['label', 'name']" value-key="id" />
  ```

  Useful when records are inconsistent, e.g. some carry `label` and others `name`. A single string behaves exactly as before.

  The resolved label is used for search matching as well as display.

- 3a17616: Add a `noOptionsText` prop, and show a message when there are no options at all.

  Previously the empty message only appeared while searching, so an empty `options` array opened a completely blank panel with no text.

  `noOptionsText` (default `"No options available"`) covers "there is nothing to pick from"; `noResultsText` still covers "your search matched nothing". The `empty` slot receives whichever applies.

- 3a17616: Add a `searchNested` prop for tree mode. A multi-word query can then match across a node's ancestor path.

  ```vue
  <VPick :options="options" searchable search-nested />
  ```

  Searching "electronics gaming" finds `Gaming` under `Electronics > Laptops`, because every word appears somewhere in that path. Single-word queries are unaffected, and words from unrelated branches still do not match.

### Patch Changes

- f5c4c69: Stop empty-branch placeholder rows leaking into the option set.

  The row shown under an expanded branch with an empty `children` array shares its parent's option, so it appeared a second time in the hidden `<select>` used for form submission, producing a duplicate `<option>` and a Vue duplicate-key warning. It also counted toward value lookups and chip ordering.

  Also fixes the placeholder's `:key` in the Vue 2 build, which used a template literal. The Vue 2 template compiler truncates those in attribute expressions, so the key was malformed.

## 0.15.1

### Patch Changes

- 1470ae2: Reveal the current selection when a tree dropdown opens. Collapsed ancestors of the selected node are now expanded, so the row can be highlighted and scrolled to.

  Previously a selection nested inside a collapsed branch was invisible on open: the tree appeared to have nothing selected, and the usual scroll-to-selection had no row to scroll to.

  Nothing changes when there is no selection, when the selection is already visible, or for flat lists.

## 0.15.0

### Minor Changes

- e73c669: Add an `alwaysOpen` prop. The list renders permanently in the page instead of as a dropdown, and cannot be closed.

  ```vue
  <VPick v-model="selected" :options="options" always-open multiple />
  ```

  Useful inside a filter panel where the list is the content rather than something to reveal. The panel is laid out in normal flow, so it is not teleported, not positioned, and does not lock body scroll. The chevron is hidden and the root gains a `vpick--inline` class for styling. Search, selection and keyboard navigation are unchanged. A disabled control still closes.

### Patch Changes

- f9d6be0: Close the dropdown when the control becomes disabled or starts loading, and ignore selections while it is.

  An open dropdown previously stayed open after `disabled` was set. Its options remained clickable and still emitted `update:modelValue`, while the trigger could no longer be used to close it.

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
