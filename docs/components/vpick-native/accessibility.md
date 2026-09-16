---
title: Accessibility
description: VPickNative renders a real native select, so keyboard support, screen reader behaviour, and the mobile picker are the platform's rather than reimplemented.
---

# Accessibility

`VPickNative` renders a real `<select>`. Almost everything on this page is the
browser's behaviour rather than the component's, which is the main reason to
choose it.

## Keyboard and screen readers

Keyboard behaviour is the platform's: on desktop the browser's own listbox, on
mobile the native picker. Screen reader support is whatever the operating system
provides for a `<select>`, so it works in places a scripted dropdown has to earn
one browser at a time.

There is nothing to configure, and nothing that can fall out of sync.

## State

- `aria-invalid` is set when the `error` prop is present.
- `aria-busy` is set when `loading` is true.
- `aria-describedby` is wired through the `ariaDescribedby` prop, for hint or
  error text.
- Disabled uses the native `disabled` attribute, not `pointer-events`, so the
  control is genuinely unreachable rather than merely unclickable.

## Labelling

`id` lands on the `<select>` itself, so a `<label for>` resolves to it. See
[Forms](/components/vpick-native/forms#labelling).

## Props

<PropList component="VPickNative" names="ariaLabel,ariaDescribedby,error" />
