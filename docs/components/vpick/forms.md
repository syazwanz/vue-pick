---
title: Forms
description: Label, submit, and validate VPick. A visually hidden native select carries the value, so name and required behave as expected.
---

# Forms

## Labelling

Pair a label with `for` and `id` rather than wrapping the component in it:

```vue
<label for="status">Status</label>
<VPick id="status" v-model="selected" :options="options" multiple />
```

`id` is applied to the control itself, the `<button role="combobox">` in button
mode and the `<input role="combobox">` in searchable and `multiple`, so `for`
resolves to the right element and clicking the label focuses it.

Wrapping instead binds the label to its first labelable descendant. In
`multiple` mode that is the first chip's remove button, so clicking the label
deletes a chip.

`ariaLabel` is the alternative when there is no visible label.

## Submitting

A visually hidden native `<select>` is kept in sync with the value, so a VPick
inside a `<form>` submits like any other field. Give it a `name`:

```vue
<form method="post">
  <VPick name="status" v-model="selected" :options="options" />
  <button type="submit">Save</button>
</form>
```

In `multiple` mode it renders as `<select multiple>` and serializes each
selected value under the same name.

Two things follow from it being a real form control:

- It always posts plain values, even under `valueFormat="object"`, since a form
  field cannot carry an object. See
  [Object values](/components/vpick#object-values).
- `required` participates in native validation.

It is also what lets Safari autofill find the field.

Roles, keyboard support and screen reader behaviour are on
[Accessibility](/components/vpick/accessibility).

## Props

<PropList names="id,name,required" />
