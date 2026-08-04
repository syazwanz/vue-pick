import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  setupScrollListeners,
  isPinnedWithin,
} from "../../src/core/scrollListeners"

describe("setupScrollListeners", () => {
  let container: HTMLElement
  let scrollableParent: HTMLElement
  let trigger: HTMLElement

  beforeEach(() => {
    // Setup a DOM tree: container -> scrollableParent -> trigger
    container = document.createElement("div")
    scrollableParent = document.createElement("div")
    trigger = document.createElement("div")

    // Mock getComputedStyle for our elements since happy-dom might not
    // compute layout fully without being attached to the actual document and having stylesheets
    vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
      if (el === scrollableParent) {
        return {
          overflow: "auto",
          overflowX: "",
          overflowY: "",
        } as CSSStyleDeclaration
      }
      return {
        overflow: "visible",
        overflowX: "",
        overflowY: "",
      } as CSSStyleDeclaration
    })

    scrollableParent.appendChild(trigger)
    container.appendChild(scrollableParent)
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("attaches listeners to scrollable parents and window, and cleans them up", () => {
    const callback = vi.fn()

    const scrollableParentSpyAdd = vi.spyOn(
      scrollableParent,
      "addEventListener",
    )
    const scrollableParentSpyRemove = vi.spyOn(
      scrollableParent,
      "removeEventListener",
    )

    const containerSpyAdd = vi.spyOn(container, "addEventListener")

    const windowSpyAdd = vi.spyOn(window, "addEventListener")
    const windowSpyRemove = vi.spyOn(window, "removeEventListener")

    const cleanup = setupScrollListeners(trigger, callback)

    expect(scrollableParentSpyAdd).toHaveBeenCalledWith("scroll", callback, {
      passive: true,
    })

    expect(containerSpyAdd).not.toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      expect.any(Object),
    )

    expect(windowSpyAdd).toHaveBeenCalledWith("scroll", callback, {
      passive: true,
    })
    expect(windowSpyAdd).toHaveBeenCalledWith("resize", callback, {
      passive: true,
    })

    const scrollEvent = new Event("scroll")
    scrollableParent.dispatchEvent(scrollEvent)
    expect(callback).toHaveBeenCalledTimes(1)

    cleanup()

    expect(scrollableParentSpyRemove).toHaveBeenCalledWith("scroll", callback)
    expect(windowSpyRemove).toHaveBeenCalledWith("scroll", callback)
    expect(windowSpyRemove).toHaveBeenCalledWith("resize", callback)
  })
})

describe("isPinnedWithin", () => {
  // Anchoring the panel inside a scroll container assumes the trigger travels
  // with it. A `position: fixed` ancestor in between breaks that: the container
  // scrolls, the trigger does not, and the panel slides away from a trigger
  // that never moved.
  function tree(positions: Record<string, string>) {
    const scroller = document.createElement("div")
    const middle = document.createElement("div")
    const trigger = document.createElement("button")
    scroller.appendChild(middle)
    middle.appendChild(trigger)
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      (el: Element) =>
        ({
          position:
            el === scroller
              ? (positions.scroller ?? "static")
              : el === middle
                ? (positions.middle ?? "static")
                : (positions.trigger ?? "static"),
        }) as CSSStyleDeclaration,
    )
    return { scroller, trigger }
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("reports a fixed ancestor between the trigger and the scroller", () => {
    const { scroller, trigger } = tree({ middle: "fixed" })
    expect(isPinnedWithin(trigger, scroller)).toBe(true)
  })

  it("reports a fixed trigger itself", () => {
    const { scroller, trigger } = tree({ trigger: "fixed" })
    expect(isPinnedWithin(trigger, scroller)).toBe(true)
  })

  it("ignores static and relative ancestors", () => {
    const { scroller, trigger } = tree({ middle: "relative" })
    expect(isPinnedWithin(trigger, scroller)).toBe(false)
  })

  // Sticky travels with the content for most of its range and only parks at an
  // edge, so it still benefits from anchoring.
  it("does not treat sticky as pinned", () => {
    const { scroller, trigger } = tree({ middle: "sticky" })
    expect(isPinnedWithin(trigger, scroller)).toBe(false)
  })

  // The scroller itself counts. A pinned scroller (a modal overlay once its
  // content overflows) is only the scroller while its content is tall enough,
  // so excluding it made resolution flip with the modal's height, and a panel
  // parented into it leaks wheel input to the page behind. This inverts the
  // original decision, which stopped the walk just short of the scroller.
  it("treats a fixed scroller itself as pinned", () => {
    const { scroller, trigger } = tree({ scroller: "fixed" })
    expect(isPinnedWithin(trigger, scroller)).toBe(true)
  })

  it("a merely positioned scroller is not pinned", () => {
    const { scroller, trigger } = tree({ scroller: "relative" })
    expect(isPinnedWithin(trigger, scroller)).toBe(false)
  })
})

describe("isPinnedWithin with no scroller", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // A null scroller means the page is the scroll container. A pinned trigger
  // does not travel with the page either, so the walk runs to the root.
  it("finds a fixed ancestor when the walk runs to the root", () => {
    const middle = document.createElement("div")
    const trigger = document.createElement("button")
    middle.appendChild(trigger)
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      (el: Element) =>
        ({
          position: el === middle ? "fixed" : "static",
        }) as CSSStyleDeclaration,
    )
    expect(isPinnedWithin(trigger, null)).toBe(true)
  })

  it("reports unpinned when nothing on the way is fixed", () => {
    const middle = document.createElement("div")
    const trigger = document.createElement("button")
    middle.appendChild(trigger)
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      () => ({ position: "static" }) as CSSStyleDeclaration,
    )
    expect(isPinnedWithin(trigger, null)).toBe(false)
  })
})
