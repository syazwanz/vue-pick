const SCROLLABLE = /(auto|scroll|overlay)/

function isScrollable(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el)
  return SCROLLABLE.test(style.overflow + style.overflowY + style.overflowX)
}

/**
 * Every ancestor of `el` that can scroll, nearest first.
 */
export function scrollParents(el: HTMLElement): HTMLElement[] {
  const parents: HTMLElement[] = []
  let node: HTMLElement | null = el.parentElement

  while (node) {
    if (isScrollable(node)) parents.push(node)
    node = node.parentElement
  }

  return parents
}

/**
 * The nearest scrollable ancestor, or null when the page itself is the only
 * scroll container.
 *
 * Finding the scroller and deciding whether it can anchor the panel are
 * separate questions: see `establishesContainingBlock` for the second.
 */
export function findScrollParent(el: HTMLElement): HTMLElement | null {
  return scrollParents(el)[0] ?? null
}

/**
 * Whether `el` is pinned to the viewport rather than carried by `scroller`.
 *
 * Anchoring the panel inside a scroll container assumes the trigger travels
 * with that container. A `position: fixed` ancestor in between breaks the
 * assumption: the container scrolls, the trigger does not, and the panel (a
 * child of the container) slides away from a trigger that never moved. That is
 * the trailing `absolute` exists to prevent, so a pinned trigger is the one
 * case where anchoring is worse than staying with `fixed`.
 *
 * A null `scroller` means the page itself is the scroll container, and the
 * walk runs to the root: a pinned trigger does not travel with the page
 * either, so page-anchoring it has the same drift.
 *
 * The scroller itself is included in the walk. A pinned element that scrolls
 * (a modal overlay once its content overflows) is geometrically anchorable,
 * but whether such an element is the scroller at all flips with its content
 * height, and a panel parented into it leaks wheel input to the page behind.
 * `fixed` costs only the frame of trailing during the modal's own scroll, so
 * pinned-and-scrolling resolves the same way as pinned-below-the-scroller and
 * the behavior stops depending on how tall the modal happens to be.
 *
 * `sticky` is deliberately not treated as pinned. It travels with the content
 * for most of its range and only parks at an edge, so it still benefits.
 */
export function isPinnedWithin(
  el: HTMLElement,
  scroller: HTMLElement | null,
): boolean {
  let node: HTMLElement | null = el
  while (node) {
    if (window.getComputedStyle(node).position === "fixed") return true
    if (node === scroller) return false
    node = node.parentElement
  }
  return false
}

export function setupScrollListeners(
  el: HTMLElement,
  callback: (e?: Event) => void,
): () => void {
  const parents = scrollParents(el)

  // Attach scroll listeners to all scrollable parents
  parents.forEach((parent) => {
    parent.addEventListener("scroll", callback, { passive: true })
  })

  // Always attach to window for document-level scrolling and resizing
  window.addEventListener("scroll", callback, { passive: true })
  window.addEventListener("resize", callback, { passive: true })

  // Return cleanup function
  return () => {
    parents.forEach((parent) => {
      parent.removeEventListener("scroll", callback)
    })
    window.removeEventListener("scroll", callback)
    window.removeEventListener("resize", callback)
  }
}
