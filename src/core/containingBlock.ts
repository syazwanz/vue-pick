/**
 * Whether `el` establishes a containing block for absolutely-positioned
 * descendants.
 *
 * This is what decides if the dropdown can be anchored inside a scroll
 * container: `position: absolute` only scrolls with the content when the
 * panel's containing block is the scroller itself. Anchored to something
 * further up the tree, the panel would sit still while the content moved
 * underneath it, which is worse than trailing.
 */
export function establishesContainingBlock(el: HTMLElement): boolean {
  const cs = window.getComputedStyle(el)
  // Every property is read defensively: a partial CSSOM implementation reports
  // "" rather than the initial value, and "" must read as "not positioned".
  if (cs.position && cs.position !== "static") return true
  if (cs.transform && cs.transform !== "none") return true
  if (cs.perspective && cs.perspective !== "none") return true
  if (cs.filter && cs.filter !== "none") return true
  if (/(transform|perspective|filter)/.test(cs.willChange || "")) return true
  if (/(layout|paint|strict|content)/.test(cs.contain || "")) return true
  return false
}

// Refcounted, because several components can share one scroll container and the
// last one out has to be the one that restores it.
const promoted = new WeakMap<
  HTMLElement,
  { count: number; originalInline: string }
>()

/**
 * Give `el` a containing block by setting `position: relative`, if it does not
 * have one already.
 *
 * This mutates the caller's DOM, so it is only ever reached through an explicit
 * `strategy="absolute"`. Note the mutation affects every absolutely-positioned
 * descendant of `el`, not only the dropdown.
 *
 * No-op when `el` already establishes a containing block, in which case
 * `releaseContainingBlock` will not touch it either.
 */
export function promoteToContainingBlock(el: HTMLElement): void {
  const entry = promoted.get(el)
  if (entry) {
    entry.count++
    return
  }
  if (establishesContainingBlock(el)) return
  // The *inline* value is captured, not the computed one: restoring a computed
  // value would write a hard "static" over whatever a stylesheet had said.
  promoted.set(el, { count: 1, originalInline: el.style.position })
  el.style.position = "relative"
}

/**
 * Undo one `promoteToContainingBlock`. The original inline value comes back
 * only once every holder has released.
 */
export function releaseContainingBlock(el: HTMLElement): void {
  const entry = promoted.get(el)
  if (!entry) return
  entry.count--
  if (entry.count > 0) return
  el.style.position = entry.originalInline
  promoted.delete(el)
}
