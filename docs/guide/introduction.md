---
title: Introduction
description: Vue Pick is a lightweight, zero-dependency select component library for Vue 2.7 and Vue 3, with full keyboard navigation, ARIA support, and themeable CSS custom properties.
---

# Introduction

Vue Pick is an accessible select component library for Vue 2.7 and Vue 3. It ships two components with a shared API, slots, and props across both Vue versions — so migrating from Vue 2 to Vue 3 is a single import path change.

Zero runtime dependencies. CSS custom properties for theming. Built for accessibility, forms, and production use.

## Components

| Component | Status | Description |
| --- | --- | --- |
| `VPickNative` | Available | A styled wrapper around the native `<select>` element |
| `VPick` | Available | A custom dropdown with keyboard navigation and group labels |

> Both components support Vue 2.7 and Vue 3.

## Which one should I use?

**Use `VPickNative`** when you want native browser behaviour, better mobile UX, and simpler integration. The browser handles the dropdown, keyboard, and accessibility for you.

**Use `VPick`** when you need custom styling of the dropdown panel, group labels with separators, or control over how individual options render.

## Next steps

- [Installation](/guide/installation) — install the package and import the stylesheet
- [Theming](/guide/theming) — customize with CSS variables
- [VPickNative](/components/vpick-native) — full API reference
- [VPick](/components/vpick) — full API reference
