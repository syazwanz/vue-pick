/**
 * Whether `rect` is fully clipped out of view, either by the viewport or by any
 * of the scroll containers the element lives in.
 *
 * "Fully" is deliberate: a partially visible trigger still tells the user what
 * the panel belongs to, so only one that has left the box entirely counts as
 * hidden.
 *
 * Note this is about clipping, not occlusion. An element covered by a fixed
 * header is not hidden by this measure, because nothing clips it.
 *
 * Takes an already-measured rect rather than the element, so a caller that is
 * positioning on the same frame does not pay for a second layout read.
 */
export function isClippedOutOfView(
  rect: DOMRect,
  scrollAncestors: readonly HTMLElement[] = [],
): boolean {
  if (typeof window === "undefined") return false

  const outside = (box: {
    top: number
    bottom: number
    left: number
    right: number
  }) =>
    rect.bottom <= box.top ||
    rect.top >= box.bottom ||
    rect.right <= box.left ||
    rect.left >= box.right

  if (
    outside({
      top: 0,
      bottom: window.innerHeight,
      left: 0,
      right: window.innerWidth,
    })
  ) {
    return true
  }

  for (const ancestor of scrollAncestors) {
    if (outside(ancestor.getBoundingClientRect())) return true
  }

  return false
}
