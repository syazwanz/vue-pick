import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { setupScrollListeners } from "../../src/core/scrollListeners"

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
