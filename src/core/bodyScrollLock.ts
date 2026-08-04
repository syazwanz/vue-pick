// Scroll locking by swallowing the input, not by hiding the scrollbar.
//
// The previous implementation set `overflow: hidden` and padded the content by
// the scrollbar's width. Hiding the scrollbar resizes the viewport, and
// anything sized against the viewport (fixed headers, sidebars) shifts on
// every open and close. Compensation can only reach in-flow content, so the
// class of bug is unfixable in that design. Blocking the wheel and touch input
// instead leaves layout completely untouched: the scrollbar stays visible, it
// just does not move.
//
// Keyboard scrolling is deliberately not intercepted. While a lock is held the
// dropdown owns focus, and every scrolling key is already handled or swallowed
// by its own keyboard navigation.

// One lock entry per element, refcounted: several open dropdowns can share one
// scroller (the body, or one dashboard pane), and the lock releases when the
// last one lets go.
const lockCounts = new Map<HTMLElement, number>()

let listenersInstalled = false

// Whether the element itself could consume a scroll gesture.
function canScroll(el: HTMLElement): boolean {
  const style = getComputedStyle(el)
  const overflow = style.overflowY + style.overflowX
  if (!/(auto|scroll|overlay)/.test(overflow)) return false
  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
}

// A gesture scrolls the nearest scrollable ancestor of its target; with none
// on the way up, it scrolls the page. Blocked when that destination is locked.
// A destination inside a locked container (the dropdown's own list) stays
// scrollable, which is the difference between locking a scroller and freezing
// everything under it. Chaining out of that inner scroller at its boundary is
// stopped by `overscroll-behavior`, not here.
function gestureIsLocked(target: EventTarget | null): boolean {
  let node = target instanceof Element ? target : null
  while (node instanceof HTMLElement && node !== document.documentElement) {
    if (node === document.body) break
    if (canScroll(node)) return lockCounts.has(node)
    node = node.parentElement
  }
  return lockCounts.has(document.body)
}

function onScrollInput(e: Event) {
  if (!e.cancelable) return
  if (gestureIsLocked(e.target)) e.preventDefault()
}

// Capture phase for the same reason as the outside-click listener: a widget
// that stops propagation in its own handler must not be able to unfreeze the
// page underneath it. `passive: false` is what makes preventDefault count.
const LISTENER_OPTS = { capture: true, passive: false } as const

function installListeners() {
  if (listenersInstalled) return
  listenersInstalled = true
  document.addEventListener("wheel", onScrollInput, LISTENER_OPTS)
  document.addEventListener("touchmove", onScrollInput, LISTENER_OPTS)
}

function removeListeners() {
  if (!listenersInstalled) return
  listenersInstalled = false
  document.removeEventListener("wheel", onScrollInput, LISTENER_OPTS)
  document.removeEventListener("touchmove", onScrollInput, LISTENER_OPTS)
}

/**
 * Stop `el` from scrolling until the returned release is called. Layout is
 * never touched, so nothing on the page moves when a lock is taken or
 * released.
 */
export function lockScroll(el: HTMLElement): () => void {
  if (typeof document === "undefined") return () => {}

  lockCounts.set(el, (lockCounts.get(el) ?? 0) + 1)
  installListeners()

  let released = false
  return () => {
    if (released) return
    released = true
    const count = lockCounts.get(el)
    if (count === undefined) return
    if (count > 1) {
      lockCounts.set(el, count - 1)
      return
    }
    lockCounts.delete(el)
    if (lockCounts.size === 0) removeListeners()
  }
}

// Body-only wrappers, kept so existing callers and the public core API stay
// intact. `unlockBodyScroll` releases one body lock, matching the old
// refcounted pairing.
const bodyReleases: Array<() => void> = []

export function lockBodyScroll(): void {
  bodyReleases.push(lockScroll(document.body))
}

export function unlockBodyScroll(): void {
  bodyReleases.pop()?.()
}
