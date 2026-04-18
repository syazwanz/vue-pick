let lockCount = 0
let initialOverflow: string | undefined
let initialPaddingRight: string | undefined
let touchMoveHandler: ((e: TouchEvent) => void) | null = null

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return (
    /iP(ad|hone|od)/.test(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  )
}

// Only treat an element as scrollable when it can actually scroll.
// `overflow: scroll` is always scrollable; `overflow: auto` requires content
// that exceeds the container. Matches Reka / vueuse useScrollLock.
function isScrollable(el: Element | null): boolean {
  while (el && el !== document.body) {
    const style = getComputedStyle(el)
    if (
      style.overflowY === "scroll" ||
      style.overflowX === "scroll" ||
      (style.overflowY === "auto" && el.clientHeight < el.scrollHeight) ||
      (style.overflowX === "auto" && el.clientWidth < el.scrollWidth)
    ) {
      return true
    }
    el = el.parentElement
  }
  return false
}

export function lockBodyScroll(): void {
  lockCount++
  if (lockCount > 1) return
  if (typeof document === "undefined") return

  const body = document.body
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth

  initialOverflow = body.style.overflow
  initialPaddingRight = body.style.paddingRight
  body.style.overflow = "hidden"
  if (scrollbarWidth > 0) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${current + scrollbarWidth}px`
  }

  if (isIOS()) {
    touchMoveHandler = (e) => {
      if (e.touches.length !== 1) return
      if (isScrollable(e.target as Element)) return
      e.preventDefault()
    }
    document.addEventListener("touchmove", touchMoveHandler, { passive: false })
  }
}

export function unlockBodyScroll(): void {
  if (lockCount === 0) return
  lockCount--
  if (lockCount > 0) return
  if (typeof document === "undefined") return

  const body = document.body
  body.style.overflow = initialOverflow ?? ""
  body.style.paddingRight = initialPaddingRight ?? ""
  initialOverflow = undefined
  initialPaddingRight = undefined

  if (touchMoveHandler) {
    document.removeEventListener("touchmove", touchMoveHandler)
    touchMoveHandler = null
  }
}
