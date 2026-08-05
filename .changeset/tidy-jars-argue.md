---
"vue-pick": patch
---

`searchable` has never had any effect alongside `multiple`, because the
searchable trigger is the only one that draws chips. Passing
`:searchable="false"` there now logs a warning in development instead of
silently doing nothing, and the docs say so.

Also documents three things about placing a control inside a popover or panel:
`overflow: hidden` on the container clips the trigger's focus ring, an
edge-to-edge trigger wants an inset ring, and percentages inside the control
resolve against `--vpick-width` once it is pinned.
