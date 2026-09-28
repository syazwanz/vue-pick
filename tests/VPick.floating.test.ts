import { describe, it, expect, vi, afterEach } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import * as FloatingUI from "@floating-ui/dom"
import VPick from "../src/vue3/VPick.vue"
import type { FloatingUiLibrary } from "../src/core"

// Compile-time check: the real library is accepted as the prop, as documented.
const realLibrary: FloatingUiLibrary = FloatingUI

const opts = [
  { label: "Todo", value: "todo" },
  { label: "Done", value: "done" },
]

afterEach(() => {
  document.body
    .querySelectorAll('.vpick-positioner, [role="listbox"]')
    .forEach((n) => n.remove())
})

type Result = {
  x: number
  y: number
  placement: string
  strategy: "absolute" | "fixed"
  middlewareData?: { hide?: { referenceHidden?: boolean } }
}

// Stands in for the library. `autoUpdate` runs the first update straight away,
// as the real one does, and keeps the callback so a test can fire later ones.
function fakeLibrary(answer: () => Result | Promise<Result>) {
  const stop = vi.fn()
  let update: () => void = () => {}
  return {
    stop,
    runUpdate: () => update(),
    computePosition: vi.fn<
      [HTMLElement, HTMLElement, unknown?],
      Promise<Result>
    >(() => Promise.resolve(answer())),
    autoUpdate: vi.fn(
      (
        _reference: HTMLElement,
        _floating: HTMLElement,
        onUpdate: () => void,
      ) => {
        update = onUpdate
        onUpdate()
        return stop
      },
    ),
    offset: vi.fn((value?: number) => ({ name: "offset", value })),
    flip: vi.fn((options?: unknown) => ({ name: "flip", options })),
    shift: vi.fn((options?: { padding: number }) => ({
      name: "shift",
      options,
    })),
    hide: vi.fn((options?: unknown) => ({ name: "hide", options })),
  }
}

function at(x: number, y: number, extra: Partial<Result> = {}): Result {
  return { x, y, placement: "bottom-start", strategy: "absolute", ...extra }
}

function middlewareNames(lib: ReturnType<typeof fakeLibrary>, call = 0) {
  const options = lib.computePosition.mock.calls[call][2] as {
    middleware: { name: string }[]
  }
  return options.middleware.map((m) => m.name)
}

async function openWith(
  floatingUi: FloatingUiLibrary,
  props: Record<string, unknown> = {},
  rootStyle = "",
) {
  const wrapper = mount(VPick, {
    props: { options: opts, floatingUi, ...props },
    attrs: rootStyle ? { style: rootStyle } : {},
    attachTo: document.body,
    global: { stubs: { Teleport: false } },
  })
  await wrapper.find('[role="combobox"]').trigger("click")
  await flushPromises()
  const positioner =
    document.body.querySelector<HTMLElement>(".vpick-positioner")!
  return { wrapper, positioner }
}

describe("VPick — floatingUi", () => {
  it("hands Floating UI the trigger, the panel and its own middleware", async () => {
    const lib = fakeLibrary(() => at(0, 0))
    const { wrapper, positioner } = await openWith(lib)

    const [reference, floating, options] = lib.computePosition.mock.calls[0]
    expect(reference).toBe(wrapper.find('[role="combobox"]').element)
    expect(floating).toBe(positioner)
    expect(options).toMatchObject({
      placement: "bottom-start",
      strategy: "absolute",
    })
    expect(lib.offset).toHaveBeenCalledWith(4)
    expect(lib.flip).toHaveBeenCalledWith()
    expect(lib.shift).toHaveBeenCalledWith({ padding: 8 })
    expect(lib.hide).toHaveBeenCalledWith()
    expect(middlewareNames(lib)).toEqual(["offset", "flip", "shift", "hide"])
    wrapper.unmount()
  })

  it("leaves hide out when hideWhenDetached is off", async () => {
    const lib = fakeLibrary(() => at(0, 0))
    const { wrapper } = await openWith(lib, { hideWhenDetached: false })
    expect(lib.hide).not.toHaveBeenCalled()
    expect(middlewareNames(lib)).toEqual(["offset", "flip", "shift"])
    wrapper.unmount()
  })

  it("applies the position, strategy and side it returns", async () => {
    const lib = fakeLibrary(() =>
      at(12, 34, { placement: "top-end", strategy: "fixed" }),
    )
    const { wrapper, positioner } = await openWith(lib)
    expect(positioner.style.transform).toBe("translate3d(12px, 34px, 0)")
    expect(positioner.style.position).toBe("fixed")
    expect(positioner.getAttribute("data-placement")).toBe("top")
    wrapper.unmount()
  })

  it("passes align and the gap variable through", async () => {
    const lib = fakeLibrary(() => at(0, 0, { placement: "bottom-end" }))
    const { wrapper } = await openWith(
      lib,
      { align: "end" },
      "--vpick-listbox-offset: 20px",
    )
    expect(lib.computePosition.mock.calls[0][2]).toMatchObject({
      placement: "bottom-end",
    })
    expect(lib.offset).toHaveBeenCalledWith(20)
    wrapper.unmount()
  })

  it("lines up with the trigger's start edge in a right-to-left page", async () => {
    const lib = fakeLibrary(() => at(0, 0, { placement: "bottom-end" }))
    const { wrapper } = await openWith(lib, {}, "direction: rtl")
    // The panel sits in a left-to-right <body>, so the right edge is "end" there.
    expect(lib.computePosition.mock.calls[0][2]).toMatchObject({
      placement: "bottom-end",
    })
    wrapper.unmount()
  })

  it("applies only the newest answer when an older one arrives late", async () => {
    let releaseFirst!: () => void
    const first = new Promise<Result>((resolve) => {
      releaseFirst = () => resolve(at(1, 1))
    })
    let calls = 0
    const lib = fakeLibrary(() => (++calls === 1 ? first : at(99, 99)))
    const { wrapper, positioner } = await openWith(lib)
    lib.runUpdate()
    await flushPromises()
    releaseFirst()
    await flushPromises()

    expect(calls).toBe(2)
    expect(positioner.style.transform).toBe("translate3d(99px, 99px, 0)")
    wrapper.unmount()
  })

  it("is not used for an alwaysOpen list, which sits in the page", async () => {
    const lib = fakeLibrary(() => at(5, 5))
    const wrapper = mount(VPick, {
      props: { options: opts, floatingUi: lib, alwaysOpen: true },
      attachTo: document.body,
    })
    await flushPromises()
    expect(lib.autoUpdate).not.toHaveBeenCalled()
    expect(lib.computePosition).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it("works with the real library, and closes cleanly", async () => {
    const { wrapper, positioner } = await openWith(realLibrary)
    expect(positioner.style.transform).toMatch(
      /^translate3d\(-?[\d.]+px, -?[\d.]+px, 0\)$/,
    )
    await wrapper.find('[role="combobox"]').trigger("click")
    await flushPromises()
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
    wrapper.unmount()
  })
})

// Floating UI decides when the panel moves. VPick's own scroll and resize
// listeners are never set up, so only `autoUpdate` asks for a new position.
describe("VPick — floatingUi owns the timing", () => {
  it("starts autoUpdate on open with the trigger, the panel and its defaults", async () => {
    const lib = fakeLibrary(() => at(0, 0))
    const { wrapper, positioner } = await openWith(lib)
    expect(lib.autoUpdate).toHaveBeenCalledTimes(1)
    const args = lib.autoUpdate.mock.calls[0]
    expect(args[0]).toBe(wrapper.find('[role="combobox"]').element)
    expect(args[1]).toBe(positioner)
    // No options object: every one of Floating UI's own triggers stays on.
    expect(args).toHaveLength(3)
    wrapper.unmount()
  })

  it("stops autoUpdate on close", async () => {
    const lib = fakeLibrary(() => at(0, 0))
    const { wrapper } = await openWith(lib)
    expect(lib.stop).not.toHaveBeenCalled()
    await wrapper.find('[role="combobox"]').trigger("click")
    await flushPromises()
    expect(lib.stop).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    expect(lib.stop).toHaveBeenCalledTimes(1)
  })

  it("stops autoUpdate when unmounted while open", async () => {
    const lib = fakeLibrary(() => at(0, 0))
    const { wrapper } = await openWith(lib)
    wrapper.unmount()
    expect(lib.stop).toHaveBeenCalledTimes(1)
  })

  it("runs none of VPick's own repositioning", async () => {
    const lib = fakeLibrary(() => at(0, 0))
    const { wrapper } = await openWith(lib, { searchable: true })
    expect(lib.computePosition).toHaveBeenCalledTimes(1)

    window.dispatchEvent(new Event("scroll"))
    window.dispatchEvent(new Event("resize"))
    // Filtering changes the list's length, which the built-in path follows.
    await wrapper.find("input").setValue("to")
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await flushPromises()
    expect(lib.computePosition).toHaveBeenCalledTimes(1)

    lib.runUpdate()
    await flushPromises()
    expect(lib.computePosition).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })
})

describe("VPick — floatingUi hides with Floating UI's hide", () => {
  it("hides the panel while Floating UI reports the trigger hidden", async () => {
    let hidden = true
    const lib = fakeLibrary(() =>
      at(0, 0, { middlewareData: { hide: { referenceHidden: hidden } } }),
    )
    const { wrapper, positioner } = await openWith(lib)
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      true,
    )

    hidden = false
    lib.runUpdate()
    await flushPromises()
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      false,
    )
    wrapper.unmount()
  })

  it("stays shown with hideWhenDetached off, whatever the data says", async () => {
    const lib = fakeLibrary(() =>
      at(0, 0, { middlewareData: { hide: { referenceHidden: true } } }),
    )
    const { wrapper, positioner } = await openWith(lib, {
      hideWhenDetached: false,
    })
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      false,
    )
    wrapper.unmount()
  })
})

// The documented consequence of handing `flip` to Floating UI, checked against
// the library itself: with no room beside a trigger near the right edge, the
// panel lines up with the trigger's other edge.
describe("floatingUi flip", () => {
  const VIEWPORT = 1024
  const PANEL_WIDTH = 400
  const TRIGGER_RIGHT = VIEWPORT - 20

  it("lines the panel up with the trigger's other edge when there is no room", async () => {
    const panel = document.createElement("div")
    document.body.appendChild(panel)
    // Floating UI measures a panel by its offset size, which happy-dom leaves
    // at zero, and reads the viewport from the root element's client size.
    Object.defineProperty(panel, "offsetWidth", { value: PANEL_WIDTH })
    Object.defineProperty(panel, "offsetHeight", { value: 200 })
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: VIEWPORT,
      configurable: true,
    })
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 768,
      configurable: true,
    })
    const trigger = {
      getBoundingClientRect: () =>
        ({
          top: 100,
          bottom: 136,
          left: TRIGGER_RIGHT - 200,
          right: TRIGGER_RIGHT,
          width: 200,
          height: 36,
          x: TRIGGER_RIGHT - 200,
          y: 100,
        }) as DOMRect,
    }
    const placed = await FloatingUI.computePosition(trigger, panel, {
      placement: "bottom-start",
      strategy: "fixed",
      middleware: [
        FloatingUI.offset(4),
        FloatingUI.flip(),
        FloatingUI.shift({ padding: 8 }),
      ],
    })
    panel.remove()
    expect(placed.placement).toBe("bottom-end")
    expect(placed.x + PANEL_WIDTH).toBe(TRIGGER_RIGHT)
  })
})

// Floating UI cannot move elements, so VPick still renders the panel into its
// container, and the strategy follows from where the panel lives.
describe("VPick — floatingUi keeps VPick's anchoring", () => {
  function rectAt(top: number): DOMRect {
    return {
      top,
      bottom: top + 36,
      left: 20,
      right: 220,
      width: 200,
      height: 36,
      x: 20,
      y: top,
      toJSON: () => ({}),
    } as DOMRect
  }

  function scrollContainer() {
    const container = document.createElement("div")
    container.style.overflowY = "auto"
    container.style.position = "relative"
    document.body.appendChild(container)
    container.getBoundingClientRect = () =>
      ({ top: 100, bottom: 300, left: 0, right: 300 }) as DOMRect
    const host = document.createElement("div")
    container.appendChild(host)
    return { container, host }
  }

  it("passes the strategy VPick resolved", async () => {
    const lib = fakeLibrary(() => at(0, 0))
    const { wrapper } = await openWith(lib, { strategy: "fixed" })
    expect(lib.computePosition.mock.calls[0][2]).toMatchObject({
      strategy: "fixed",
    })
    wrapper.unmount()
  })

  it("places the panel inside a scroll container, as the built-in positioning does", async () => {
    const { container, host } = scrollContainer()
    const lib = fakeLibrary(() => at(0, 0))
    const wrapper = mount(VPick, {
      props: { options: opts, floatingUi: lib },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    ;(
      wrapper.find('[role="combobox"]').element as HTMLElement
    ).getBoundingClientRect = () => rectAt(150)
    await wrapper.find('[role="combobox"]').trigger("click")
    await flushPromises()

    const positioner = container.querySelector(".vpick-positioner")
    expect(positioner?.parentElement).toBe(container)
    expect(lib.computePosition.mock.calls[0][2]).toMatchObject({
      strategy: "absolute",
    })
    wrapper.unmount()
    container.remove()
  })

  it("does not run VPick's own check for a scrolled-away trigger", async () => {
    const { container, host } = scrollContainer()
    const lib = fakeLibrary(() =>
      at(0, 0, { middlewareData: { hide: { referenceHidden: false } } }),
    )
    const wrapper = mount(VPick, {
      props: { options: opts, floatingUi: lib },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    // Above the container's top edge: VPick's own check would call it hidden.
    ;(
      wrapper.find('[role="combobox"]').element as HTMLElement
    ).getBoundingClientRect = () => rectAt(40)
    await wrapper.find('[role="combobox"]').trigger("click")
    await flushPromises()
    container.dispatchEvent(new Event("scroll"))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await flushPromises()

    const positioner =
      container.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      false,
    )
    wrapper.unmount()
    container.remove()
  })
})
