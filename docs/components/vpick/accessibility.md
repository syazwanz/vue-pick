---
title: Accessibility
description: VPick implements the WAI-ARIA listbox pattern with full keyboard navigation, active descendant tracking, and a hidden native select for assistive technology.
---

# Accessibility

VPick draws its own dropdown, so everything the browser gives a native
`<select>` for free has to be implemented here. This page is what that
implementation covers.

If you would rather not take on any of it, [VPickNative](/components/vpick-native)
hands the whole problem back to the browser.

## Keyboard navigation

| Key                       | Action                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Enter` / `Space`         | Open dropdown / select focused option. In searchable mode, `Space` types normally.                                         |
| `Escape`                  | Close dropdown. In searchable mode, when already closed and `clearable`, clears the selection.                             |
| `Arrow Up` / `Arrow Down` | Move focus between options                                                                                                 |
| `Home`                    | Focus first option                                                                                                         |
| `End`                     | Focus last option                                                                                                          |
| `Arrow Right`             | In tree mode, expand a collapsed branch and move to its first child.                                                       |
| `Arrow Left`              | In tree mode, collapse an expanded branch; on a leaf or collapsed branch, jump to its parent.                              |
| `Backspace`               | In `multiple` mode, removes the last selected chip when the search input is empty. Disable with `backspaceRemoves: false`. |
| `Delete`                  | Same as `Backspace`. Disable with `deleteRemoves: false`.                                                                  |
| `Tab`                     | Close dropdown and move focus                                                                                              |

Focus stays on the trigger throughout. Option rows are never focusable, so
`Tab` always leaves the control rather than walking through the list.

## Roles and state

- WAI-ARIA listbox pattern (`role="combobox"`, `role="listbox"`, `role="option"`).
- `aria-expanded` reflects open state on the trigger.
- `aria-activedescendant` tracks the focused option, which is how the highlight
  moves without focus leaving the trigger.
- `aria-multiselectable` is set on the listbox in `multiple` mode, with
  `aria-selected` reflected per option.
- `aria-invalid` is set when the `error` prop is present.
- `aria-disabled` on individual disabled options, and on branch rows made
  unselectable by `disableBranchNodes`.
- The placeholder row under an empty branch is inert: no `option` role, and
  arrow keys skip it.

## Labelling

`id` lands on the control itself, so a `<label for>` resolves to it. Wrapping
the component in a label instead binds it to the wrong element. See
[Forms](/components/vpick/forms#labelling).

## Assistive technology

Beyond the ARIA above, the
[hidden `<select>`](/components/vpick/forms#submitting) gives assistive
technology and Safari autofill a real form control to find.

## Motion

Transitions respect `prefers-reduced-motion`. See
[Theming](/guide/theming#reduced-motion).

## Props

<PropList names="ariaLabel,ariaDescribedby,error" />
