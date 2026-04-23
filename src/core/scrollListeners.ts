export function setupScrollListeners(
  el: HTMLElement,
  callback: (e?: Event) => void,
): () => void {
  const parents: HTMLElement[] = []
  let node: HTMLElement | null = el.parentElement

  while (node) {
    const style = window.getComputedStyle(node)
    const overflow = style.overflow + style.overflowY + style.overflowX
    if (/(auto|scroll|overlay)/.test(overflow)) {
      parents.push(node)
    }
    node = node.parentElement
  }

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
