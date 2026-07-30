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
 * Whether that element can actually anchor the panel is deliberately not
 * decided here. `position: absolute` only scrolls with the content when the
 * panel's containing block sits inside the scroller, which cannot be read off
 * computed styles, so the caller verifies it against the real `offsetParent`
 * once the panel is in the DOM.
 */
export function findScrollParent(el: HTMLElement): HTMLElement | null {
  return scrollParents(el)[0] ?? null
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
