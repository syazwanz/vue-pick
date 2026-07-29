---
"vue-pick": minor
---

Add a `valueFormat` prop. Set it to `"object"` and `v-model` holds your original option objects instead of plain values.

```vue
<VPick
  v-model="selected"
  :options="fruit"
  value-key="id"
  value-format="object"
/>
```

```js
// valueFormat="id" (default, unchanged)
selected = ["apple", "banana"]

// valueFormat="object"
selected = [
  { id: "apple", label: "Apple", price: 3 },
  { id: "banana", label: "Banana", price: 2 },
]
```

The emitted objects are the exact ones you passed in `options`, not VPick's normalized copies, so custom fields survive.

Objects handed back in are matched by `valueKey` rather than by identity, so a rebuilt literal such as `{ id: "apple" }` still resolves to the right option. A value with no matching option passes through untouched rather than throwing.

Internally the component still works entirely in plain values; the conversion happens only at the boundary. That means selection state, cascade, `valueConsistsOf` and the hidden `<select>` are unaffected. The hidden select always posts plain values, since a form field cannot carry an object.
