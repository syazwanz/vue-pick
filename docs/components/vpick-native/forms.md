---
title: Forms
description: Label, submit, and validate VPickNative. It renders a real native select, so name, required, and browser validation come for free.
---

# Forms

`VPickNative` renders a real `<select>`, so form behaviour on this page is the
browser's rather than the component's.

## Labelling

Pair a label with `for` and `id` rather than wrapping the component in it:

```vue
<label for="status">Status</label>
<VPickNative id="status" v-model="selected" :options="options" />
```

`id` is applied to the `<select>` itself, so `for` resolves to it and clicking
the label focuses the control.

`ariaLabel` is the alternative when there is no visible label.

## Submitting

Give it a `name` and it submits like any other field:

```vue
<form method="post">
  <VPickNative name="status" v-model="selected" :options="options" />
  <button type="submit">Save</button>
</form>
```

`name` and `required` are passed straight to the `<select>`, so `required`
participates in native validation and the browser's own "please select an item"
message appears with no work from you.

This is where the two components differ most. `VPick` has to keep a
[visually hidden `<select>`](/components/vpick/forms#submitting) in sync to
achieve the same thing. Here there is nothing to keep in sync, because the
select is the control.

Roles, keyboard support and screen reader behaviour are on
[Accessibility](/components/vpick-native/accessibility).

## Props

<PropList component="VPickNative" names="id,name,required" />
