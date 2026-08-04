---
title: Theming
description: Style Vue Pick with CSS custom properties. Override colors, spacing, and typography at any scope. Full light and dark mode support.
---

# Theming

Vue Pick uses CSS custom properties for all visual styling. Overrides can be applied globally in your root stylesheet, scoped to a container, or set inline on a single instance.

## Overriding variables

```css
/* Global override in your main CSS file */
:root {
  --vpick-border-radius: 0;
  --vpick-border-color: #d1d5db;
}
```

```vue
<!-- Scoped override, affects only instances inside this container -->
<style scoped>
.my-form {
  --vpick-border-radius: 0px;
  --vpick-bg: #f9fafb;
}
</style>
```

```vue
<!-- Inline override on a single instance -->
<VPickNative
  :options="options"
  style="--vpick-border-radius: 9999px; --vpick-border-color: #6366f1;"
/>
```

## Shared variables

These apply to both `VPickNative` and `VPick`.

| Variable                     | Default                    |
| ---------------------------- | -------------------------- |
| `--vpick-font-family`        | `inherit`                  |
| `--vpick-font-size`          | `0.875rem`                 |
| `--vpick-line-height`        | `1.25rem`                  |
| `--vpick-width`              | `fit-content`              |
| `--vpick-border-color`       | `#e5e5e5`                  |
| `--vpick-border-radius`      | `0.625rem`                 |
| `--vpick-bg`                 | `transparent`              |
| `--vpick-text-color`         | `inherit`                  |
| `--vpick-placeholder-color`  | `#737373`                  |
| `--vpick-icon-color`         | `#737373`                  |
| `--vpick-focus-border-color` | `#a1a1a1`                  |
| `--vpick-focus-ring-color`   | `rgba(161, 161, 161, 0.5)` |
| `--vpick-error-border-color` | `#dc2626`                  |
| `--vpick-error-bg`           | `rgba(220, 38, 38, 0.05)`  |
| `--vpick-error-ring-color`   | `rgba(220, 38, 38, 0.2)`   |
| `--vpick-disabled-opacity`   | `0.5`                      |
| `--vpick-height-default`     | `2rem`                     |
| `--vpick-shadow`             | `0 0 0 0 transparent`      |

## VPickNative variables

| Variable               | Default                                       |
| ---------------------- | --------------------------------------------- |
| `--vpick-native-width` | inherits from `--vpick-width` (`fit-content`) |

`--vpick-native-width` is an optional override for native-only width when you
need the native and custom triggers to be sized differently. By default it
inherits from `--vpick-width` so a single override styles both.

## VPick variables

| Variable                              | Default                                                          |
| ------------------------------------- | ---------------------------------------------------------------- |
| `--vpick-option-radius`               | `0.5rem`                                                         |
| `--vpick-option-padding-block`        | `0.25rem`                                                        |
| `--vpick-option-gap`                  | `0.125rem`                                                       |
| `--vpick-option-padding-inline-start` | `0.375rem`                                                       |
| `--vpick-listbox-bg`                  | `#fff`                                                           |
| `--vpick-listbox-shadow`              | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` |
| `--vpick-listbox-ring`                | `rgba(0, 0, 0, 0.06)`                                            |
| `--vpick-listbox-max-height`          | `16rem`                                                          |
| `--vpick-listbox-z-index`             | `50`                                                             |
| `--vpick-option-hover-bg`             | `#f5f5f5`                                                        |
| `--vpick-option-highlight-bg`         | `#f5f5f5`                                                        |
| `--vpick-option-selected-color`       | `inherit`                                                        |
| `--vpick-option-selected-bg`          | `#e3f2fd`                                                        |
| `--vpick-option-selected-weight`      | `inherit`                                                        |
| `--vpick-option-check-color`          | `currentColor`                                                   |
| `--vpick-option-empty-icon-color`     | `inherit`                                                        |
| `--vpick-group-label-color`           | `#737373`                                                        |
| `--vpick-group-label-size`            | `0.75rem`                                                        |
| `--vpick-tree-indent`                 | `1.375rem`                                                       |

`--vpick-tree-indent` is the width of one level of nesting in tree mode, applied
per depth. The default matches the width of the expand chevron and its gap, so a
child's chevron lines up under its parent's label.

`--vpick-option-gap` is the space between consecutive rows. Rows carry
backgrounds for hover and selection, and stacked flush those backgrounds merge
into one block; the gap keeps each row reading as its own object. Set it to `0`
for a continuous list.

### The selected row

In single-select the row holding the current value is tinted with
`--vpick-option-selected-bg`, so it can be found at a glance rather than by
looking for the check icon. It outranks the hover and keyboard highlight, so a
selected row keeps its tint while hovered. `multiple` is excluded, since the
checkboxes already carry that meaning.

`--vpick-option-selected-weight` is off by default, since bold text is wider and
would nudge the selected row's label. Set it to `600` to bold the row as well,
or set the tint to `transparent` to rely on the check icon alone.

```vue
<VPick
  :options="options"
  style="--vpick-option-selected-bg: #f4f4f5; --vpick-option-selected-weight: 600"
/>
```

`--vpick-option-padding-inline-start` is the row's own padding, before any tree
indent. Changing it shifts every row, including the placeholder under an empty
branch, and leaves the nesting steps intact.

`--vpick-option-empty-icon-color` colors the icon in the `no-children-icon`
slot, the one shown on the placeholder row under an empty branch. That icon is
authored in your own template but renders inside the teleported panel, so scoped
CSS cannot reach it. Set the variable on the component instead and have the
icon draw with `currentColor`:

```vue
<VPick :options="categories" style="--vpick-option-empty-icon-color: #f97316">
  <template #no-children-icon>
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor">
      <circle cx="8" cy="8" r="6" />
    </svg>
  </template>
</VPick>
```

It defaults to `inherit`, so an icon left alone still takes the row's color.

### Branch rows

Branch rows carry `.vpick-option--branch` and take two further variables. Both
fall back to the row-wide value, so setting only the values above still moves
branches with everything else.

| Variable                              | Default                             |
| ------------------------------------- | ----------------------------------- |
| `--vpick-option-branch-padding-block` | `var(--vpick-option-padding-block)` |
| `--vpick-option-branch-weight`        | `inherit`                           |

Branch rows read as section headings once `disableBranchNodes` makes them
unselectable, which is when these are usually worth setting:

```vue
<VPick
  :options="categories"
  multiple
  disable-branch-nodes
  style="--vpick-option-branch-weight: 600; --vpick-option-branch-padding-block: 0.4375rem"
/>
```

Set them inline like this rather than in a global stylesheet. The panel is
teleported out of the component, so a scoped rule cannot reach it and a plain
class rule would restyle every VPick on the page. Variables set on the component
are forwarded to the panel, which keeps the change to that one instance.

## Multiselect checkbox variables

`multiple` renders a checkbox on each option row. These style it.

| Variable                          | Default                     |
| --------------------------------- | --------------------------- |
| `--vpick-checkbox-bg`             | `transparent`               |
| `--vpick-checkbox-bg-checked`     | `#18181b`                   |
| `--vpick-checkbox-border`         | `var(--vpick-border-color)` |
| `--vpick-checkbox-border-checked` | `#18181b`                   |
| `--vpick-checkbox-color`          | `#fff`                      |
| `--vpick-checkbox-radius`         | `0.25rem`                   |

## Clear button and empty state variables

| Variable                       | Default                          |
| ------------------------------ | -------------------------------- |
| `--vpick-clear-color`          | `var(--vpick-icon-color)`        |
| `--vpick-clear-hover-bg`       | `var(--vpick-option-hover-bg)`   |
| `--vpick-icon-button-hover-bg` | `var(--vpick-option-hover-bg)`   |
| `--vpick-empty-color`          | `var(--vpick-placeholder-color)` |
| `--vpick-empty-padding`        | `0.5rem 0.625rem`                |

Each inherits from a more general variable, so overriding the general one styles
these too and the specific one is only needed to break that link.

## Multiselect chip variables

`multiple` renders each selected value as a chip in the trigger.

| Variable                           | Default              |
| ---------------------------------- | -------------------- |
| `--vpick-chip-bg`                  | `#f5f5f5`            |
| `--vpick-chip-color`               | `inherit`            |
| `--vpick-chip-border`              | `transparent`        |
| `--vpick-chip-radius`              | `0.375rem`           |
| `--vpick-chip-font-size`           | `0.75rem`            |
| `--vpick-chip-remove-color`        | `currentColor`       |
| `--vpick-chip-remove-hover-bg`     | `rgba(0, 0, 0, 0.1)` |
| `--vpick-chip-transition-duration` | `150ms`              |

Chips scale up as they are added and shrink away as they are removed, with the
remaining chips sliding across to close the gap. This variable tunes how fast
that runs:

```vue
<VPick
  v-model="selected"
  :options="options"
  multiple
  style="--vpick-chip-transition-duration: 80ms"
/>
```

To switch the motion off entirely, use the `animate` prop rather than a zero
duration. A duration of zero still runs the transition, just with no time to run
it in, which leaves the chips mid-reflow for a frame.

## Reduced motion

Every transition is disabled automatically for visitors whose system asks for
less motion, via `prefers-reduced-motion: reduce`. The loading spinner keeps
turning, since it reports progress rather than decorating.
