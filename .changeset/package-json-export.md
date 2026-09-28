---
"vue-pick": patch
---

`vue-pick/package.json` can now be imported, so tools and scripts that read the
installed version no longer fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
