---
"vue-pick": patch
---

Fix the Vue 3 type declarations, which were being overwritten by the Vue 2 build.

`vite.config.vue2.ts` ran `vite-plugin-dts` with `rollupTypes`, which names its rolled-up output after the entry file. Since that entry is `src/vue2/index.ts`, it emitted `dist/index.d.ts` and clobbered the Vue 3 declarations the first build had already produced correctly.

The published `dist/index.d.ts` was therefore Vue 2's types, carrying relative imports (`'../core'`, `'../../node_modules/vue2'`) that do not resolve inside the package. With `skipLibCheck: true`, the default in most Vite and Vue setups, TypeScript reported nothing and silently gave up on the types, so `import { VPick } from "vue-pick"` came through with no checking or autocomplete at all. With `skipLibCheck: false` it surfaced as unresolved-module errors.

The Vue 3 build already emits both `index.d.ts` and `vue2.d.ts` correctly, so the fix is to stop the Vue 2 build emitting declarations. Verified by installing the packed tarball into a clean project with Vue 3 and typechecking under `strict` with `skipLibCheck: false`.

`vue-pick/vue2` was unaffected.
