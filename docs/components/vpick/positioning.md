---
title: Positioning
description: Where the VPick dropdown renders and how it is anchored. Scroll containers, fixed strategy, scroll lock, detached triggers, and inline always-open mode.
---

<script setup>
import AlwaysOpenExample from '../../examples/vpick/always-open.vue'
import AlwaysOpenCode from '../../examples/vpick/always-open.vue?raw'
</script>

# Positioning

The dropdown is rendered outside the component so it is never clipped by an
ancestor with `overflow: hidden`. Where it gets rendered, and how it is
positioned once there, are two separate questions.

`teleportTo` answers the first, `strategy` the second, and they are honored
independently. Naming a `teleportTo` target skips auto-detection, and the
strategy stays `"fixed"` unless you ask for `"absolute"`.

## Anchoring and scroll containers

| Value              | Behavior                                                                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"auto"` (default) | Anchors to the page when nothing between the trigger and the root scrolls, to the nearest scrollable ancestor when that ancestor can hold it and the trigger travels with it, and falls back to `"fixed"` otherwise. |
| `"absolute"`       | Always anchors inside the nearest scrollable ancestor, setting `position: relative` on it if it has none.                                                                                                            |
| `"fixed"`          | Always renders in `<body>` with `position: fixed`.                                                                                                                                                                   |

This matters whenever the dropdown is open while something scrolls, whether that
is the window on an ordinary page or a content pane in a dashboard with fixed
chrome around it.

With `"fixed"`, the dropdown's coordinates are relative to the viewport, so they
change on every scrolled pixel and have to be recalculated in JavaScript. The
panel ends up a frame behind the trigger, which is visible as the panel trailing
during a scroll.

Anchored inside the scroll container, the coordinates do not depend on scroll
position at all. The browser moves the panel along with the content, so it stays
glued to the trigger and no work happens per frame.

When the window is what scrolls, `"auto"` anchors to the page and needs nothing
from you. That is the default on an ordinary page.

A trigger inside a `position: fixed` ancestor, such as a modal, is also handled
for you. It stays put while the container behind it scrolls, so there is no
trailing to avoid and anchoring would only let the panel drift away from it.
This is detected and `"fixed"` is kept.

It is the one case where an explicit `strategy="absolute"` is overruled.
Anchoring exists to stop the panel trailing a moving trigger, so with a trigger
that cannot move it has nothing to offer.

### Opting in inside a scroll container

Inside a scroll container, `"auto"` prefers anchoring but needs an ancestor that
establishes a containing block. A plain `overflow-y: auto` div does not, so
`"auto"` alone often changes nothing there. There are two ways to opt in.

Add `position: relative` to your scroll container:

```css
.content-pane {
  overflow-y: auto;
  position: relative; /* lets the dropdown anchor here */
}
```

Or pass `strategy="absolute"` and let Vue Pick set it for you:

```vue
<VPick v-model="selected" :options="options" strategy="absolute" />
```

`"absolute"` is an instruction rather than a preference, so it anchors even to a
container `"auto"` would have declined. When that container has no containing
block of its own, Vue Pick sets `position: relative` on it and puts the original
value back when the dropdown closes. A container shared by several dropdowns is
reference counted, so the last one out restores it.

Worth knowing before reaching for it: a containing block applies to every
absolutely-positioned descendant, not only the dropdown. If your pane already
holds `position: absolute` children laid out against some outer ancestor, they
will re-anchor to the pane. `"auto"` never mutates anything, and in development
it logs a warning naming the container it could not anchor to.

Use `"fixed"` when the panel is taller than its container and you would rather it
overflow the container than be clipped by it. When anchored, the panel is
measured against the container, so it flips and shrinks to fit that box instead
of the window.

## When the trigger scrolls away

An open dropdown whose trigger has scrolled out of view is anchored to something
the user can no longer see. `hideWhenDetached` hides it until the trigger comes
back:

```vue
<VPick :options="options" :hide-when-detached="false" />
```

It is hidden, not closed, so the selection, the focus position and any search
query are all still there when you scroll back.

This measures clipping, not overlap. A trigger covered by a fixed header is not
clipped by anything, so the panel stays visible and paints over the header. Give
the panel a lower `--vpick-listbox-z-index` than your header if you would rather
it slid underneath.

## Scroll lock

In button mode the scroll behind an open dropdown is locked. The lock swallows
wheel and touch input instead of hiding the scrollbar, so the page's layout is
never touched: nothing shifts on open or close, and fixed headers and sidebars
stay exactly where they are. The dropdown's own list keeps scrolling normally.

`bodyLock` controls it. Left unset it follows the mode, `true` in button mode
and `false` in searchable mode, since a searchable list is something you type
into rather than a modal moment. What gets locked is the scroll container the
dropdown is anchored in, or the page when it is anchored to neither.

```vue
<VPick :options="options" searchable :body-lock="true" />
```

## Always open

`alwaysOpen` renders the list in the page rather than as a dropdown. It cannot
be closed, and the chevron is hidden.

```vue
<VPick v-model="selected" :options="options" always-open multiple />
```

Useful inside a filter panel or popover, where the list is the content rather
than something to reveal.

<Preview :code="AlwaysOpenCode">
  <AlwaysOpenExample />
</Preview>

The panel is laid out by the browser in normal flow, so it is not teleported,
not positioned, and does not lock body scroll. Nothing on this page above
applies to it. The root gains a `vpick--inline` class for styling. Everything
else is unchanged: search, selection, chips and keyboard navigation all behave
the same.

Nothing is highlighted until the user presses a key, since a visible list is
not the same as a focused one. A disabled control closes, so the panel is not
left sitting there inert.

## Inside another container

Dropping a control into a popover, card or panel brings up a few layout
questions that are not about positioning as such. Those are covered under
[Theming](/guide/theming#inside-another-container): don't clip the container,
give an edge-to-edge trigger an inset focus ring, and remember percentages
resolve against `--vpick-width`.

## Props

<PropList group="positioning" />
