# Theming

Vue Pick uses CSS custom properties for all visual styling. Override them at any scope — globally in your root stylesheet, per-container, or inline on a single instance.

## Overriding variables

```css
/* Global — in your main CSS file */
:root {
  --vpick-border-radius: 0;
  --vpick-border-color: #d1d5db;
}
```

```vue
<!-- Scoped — affects only instances inside this container -->
<style scoped>
.my-form {
  --vpick-border-radius: 0px;
  --vpick-bg: #f9fafb;
}
</style>
```

```vue
<!-- Inline — single instance -->
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
| `--vpick-height-sm`          | `1.75rem`                  |
| `--vpick-shadow`             | `0 0 0 0 transparent`      |

## VPickNative variables

| Variable               | Default       |
| ---------------------- | ------------- |
| `--vpick-native-width` | `fit-content` |

## VPick variables

| Variable                        | Default                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `--vpick-option-radius`         | `0.5rem`                                                         |
| `--vpick-listbox-bg`            | `#fff`                                                           |
| `--vpick-listbox-shadow`        | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` |
| `--vpick-listbox-ring`          | `rgba(0, 0, 0, 0.06)`                                            |
| `--vpick-listbox-max-height`    | `16rem`                                                          |
| `--vpick-listbox-z-index`       | `50`                                                             |
| `--vpick-option-hover-bg`       | `#f5f5f5`                                                        |
| `--vpick-option-highlight-bg`   | `#f5f5f5`                                                        |
| `--vpick-option-selected-color` | `inherit`                                                        |
| `--vpick-option-check-color`    | `currentColor`                                                   |
| `--vpick-group-label-color`     | `#737373`                                                        |
| `--vpick-group-label-size`      | `0.75rem`                                                        |
