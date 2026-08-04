import { describe, it, expect, vi, afterEach } from "vitest"
import { lockScroll } from "../../src/core/bodyScrollLock"

// The lock swallows scroll input rather than hiding the scrollbar, so layout
// is never touched and nothing sized against the viewport can shift. What is
// assertable is therefore the input: a wheel whose destination is locked gets
// preventDefault, everything else passes through.

function wheelOn(target: Element): Event {
  const e = new Event("wheel", { bubbles: true, cancelable: true })
  target.dispatchEvent(e)
  return e
}

// happy-dom reports every element as unscrollable (no layout), so a scrollable
// inner element is staged by hand.
function makeScrollable(el: HTMLElement) {
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (target: Element) =>
      ({
        overflowY: target === el ? "auto" : "visible",
        overflowX: "visible",
      }) as CSSStyleDeclaration,
  )
  Object.defineProperty(el, "scrollHeight", { value: 400, configurable: true })
  Object.defineProperty(el, "clientHeight", { value: 100, configurable: true })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("lockScroll", () => {
  it("blocks wheel aimed at the page while the body is locked", () => {
    const release = lockScroll(document.body)
    expect(wheelOn(document.body).defaultPrevented).toBe(true)

    release()
    expect(wheelOn(document.body).defaultPrevented).toBe(false)
  })

  it("never touches layout styles", () => {
    const release = lockScroll(document.body)
    expect(document.body.style.overflow).toBe("")
    expect(document.body.style.paddingRight).toBe("")
    release()
  })

  // The dropdown's own list lives under the locked scroller and must keep
  // scrolling, which is the difference between locking a scroller and
  // freezing everything under it.
  it("lets wheel through to a scrollable element inside the lock", () => {
    const inner = document.createElement("div")
    document.body.appendChild(inner)
    makeScrollable(inner)

    const release = lockScroll(document.body)
    expect(wheelOn(inner).defaultPrevented).toBe(false)
    expect(wheelOn(document.body).defaultPrevented).toBe(true)

    release()
    inner.remove()
  })

  // Locking an inner pane blocks gestures landing on that pane and nothing
  // else: the page around it keeps scrolling.
  it("locks an element without locking the page", () => {
    const pane = document.createElement("div")
    document.body.appendChild(pane)
    const insidePane = document.createElement("p")
    pane.appendChild(insidePane)
    makeScrollable(pane)

    const release = lockScroll(pane)
    expect(wheelOn(insidePane).defaultPrevented).toBe(true)
    expect(wheelOn(document.body).defaultPrevented).toBe(false)

    release()
    pane.remove()
  })

  // Several open dropdowns can share one scroller, so the freeze is
  // refcounted: the last one out releases.
  it("refcounts locks on the same element", () => {
    const a = lockScroll(document.body)
    const b = lockScroll(document.body)
    a()
    expect(wheelOn(document.body).defaultPrevented).toBe(true)
    b()
    expect(wheelOn(document.body).defaultPrevented).toBe(false)
  })

  // close() and unmount can both fire for one open, so a release must be safe
  // to call twice without stealing another holder's lock.
  it("releasing twice does not release another holder", () => {
    const a = lockScroll(document.body)
    const b = lockScroll(document.body)
    a()
    a()
    expect(wheelOn(document.body).defaultPrevented).toBe(true)
    b()
    expect(wheelOn(document.body).defaultPrevented).toBe(false)
  })
})
