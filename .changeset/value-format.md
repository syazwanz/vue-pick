---
"vue-pick": minor
---

Add a `valueFormat` prop. Set it to `"object"` and `v-model` holds your original option objects instead of plain values.

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
