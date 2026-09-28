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
}

function fakeLibrary(answer: () => Result | Promise<Result>) {
  return {
    computePosition: vi.fn<
      [HTMLElement, HTMLElement, unknown?],
      Promise<Result>
    >(() => Promise.resolve(answer())),
    offset: vi.fn((value?: number) => ({ name: "offset", value })),
    flip: vi.fn((options?: unknown) => ({ name: "flip", options })),
    shift: vi.fn((options?: { padding: number }) => ({
      name: "shift",
      options,
    })),
  }
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
  it("hands Floating UI the trigger, the panel and the middleware", async () => {
    const lib = fakeLibrary(() => ({
      x: 0,
      y: 0,
      placement: "bottom-start",
      strategy: "absolute",
    }))
    const { wrapper, positioner } = await openWith(lib)

    const [reference, floating, options] = lib.computePosition.mock.calls[0]
    expect(reference).toBe(wrapper.find('[role="combobox"]').element)
    expect(floating).toBe(positioner)
    expect(options).toMatchObject({
      placement: "bottom-start",
      strategy: "absolute",
    })
    expect(lib.offset).toHaveBeenCalledWith(4)
    expect(lib.flip).toHaveBeenCalledWith({
      crossAxis: false,
      flipAlignment: false,
    })
    expect(lib.shift).toHaveBeenCalledWith({ padding: 8 })
    wrapper.unmount()
  })

  it("applies the position, strategy and side it returns", async () => {
    const lib = fakeLibrary(() => ({
      x: 12,
      y: 34,
      placement: "top-end",
      strategy: "fixed",
    }))
    const { wrapper, positioner } = await openWith(lib)
    expect(positioner.style.transform).toBe("translate3d(12px, 34px, 0)")
    expect(positioner.style.position).toBe("fixed")
    expect(positioner.getAttribute("data-placement")).toBe("top")
    wrapper.unmount()
  })

  it("passes align and the gap variable through", async () => {
    const lib = fakeLibrary(() => ({
      x: 0,
      y: 0,
      placement: "bottom-end",
      strategy: "absolute",
    }))
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
    const lib = fakeLibrary(() => ({
      x: 0,
      y: 0,
      placement: "bottom-end",
      strategy: "absolute",
    }))
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
      releaseFirst = () =>
        resolve({ x: 1, y: 1, placement: "bottom", strategy: "absolute" })
    })
    let calls = 0
    const lib = fakeLibrary(() =>
      ++calls === 1
        ? first
        : { x: 99, y: 99, placement: "bottom", strategy: "absolute" },
    )
    const wrapper = mount(VPick, {
      props: { options: opts, floatingUi: lib, searchable: true },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find("input").trigger("click")
    await flushPromises()
    // Typing changes the list length, which asks for a new position.
    await wrapper.find("input").setValue("to")
    await flushPromises()
    releaseFirst()
    await flushPromises()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(calls).toBeGreaterThan(1)
    expect(positioner.style.transform).toBe("translate3d(99px, 99px, 0)")
    wrapper.unmount()
  })

  it("is not used for an alwaysOpen list, which sits in the page", async () => {
    const lib = fakeLibrary(() => ({
      x: 5,
      y: 5,
      placement: "bottom",
      strategy: "absolute",
    }))
    const wrapper = mount(VPick, {
      props: { options: opts, floatingUi: lib, alwaysOpen: true },
      attachTo: document.body,
    })
    await flushPromises()
    expect(lib.computePosition).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it("works with the real library", async () => {
    const { wrapper, positioner } = await openWith(realLibrary)
    expect(positioner.style.transform).toMatch(
      /^translate3d\(-?[\d.]+px, -?[\d.]+px, 0\)$/,
    )
    wrapper.unmount()
  })
})

// The middleware VPick hands the real library, checked against the library
// itself: a panel too wide for the room beside a trigger near the right edge
// must slide back on screen, the way the built-in maths does, rather than jump
// to the trigger's other edge and leave `align` unhonoured.
describe("floatingUi middleware", () => {
  const VIEWPORT = 1024
  const PANEL_WIDTH = 400
  const TRIGGER_RIGHT = VIEWPORT - 20

  function panelOf(width: number, height: number) {
    const panel = document.createElement("div")
    document.body.appendChild(panel)
    // Floating UI measures a panel by its offset size, which happy-dom leaves
    // at zero, and reads the viewport from the root element's client size.
    Object.defineProperty(panel, "offsetWidth", { value: width })
    Object.defineProperty(panel, "offsetHeight", { value: height })
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: VIEWPORT,
      configurable: true,
    })
    Object.defineProperty(document.documentElement, "clientHeight", {
      value: 768,
      configurable: true,
    })
    return panel
  }

  const triggerNearRightEdge = {
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

  async function place(flipOptions?: Parameters<typeof FloatingUI.flip>[0]) {
    const panel = panelOf(PANEL_WIDTH, 200)
    const result = await FloatingUI.computePosition(
      triggerNearRightEdge,
      panel,
      {
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [
          FloatingUI.offset(4),
          FloatingUI.flip(flipOptions),
          FloatingUI.shift({ padding: 8 }),
        ],
      },
    )
    panel.remove()
    return { ...result, right: result.x + PANEL_WIDTH }
  }

  it("slides a panel that overflows sideways, keeping the aligned edge", async () => {
    const placed = await place({ crossAxis: false, flipAlignment: false })
    expect(placed.placement).toBe("bottom-start")
    expect(placed.right).toBe(VIEWPORT - 8)
  })

  it("would swap the aligned edge on Floating UI's defaults", async () => {
    const placed = await place()
    expect(placed.placement).toBe("bottom-end")
    // Lined up with the trigger instead, which leaves the panel 20px from the
    // edge here and disagrees with the built-in maths by that much.
    expect(placed.right).toBe(TRIGGER_RIGHT)
  })
})

describe("VPick — floatingUi keeps VPick's anchoring", () => {
  function anyAnswer() {
    return fakeLibrary(() => ({
      x: 0,
      y: 0,
      placement: "bottom-start",
      strategy: "absolute",
    }))
  }

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
    const lib = anyAnswer()
    const { wrapper } = await openWith(lib, { strategy: "fixed" })
    expect(lib.computePosition.mock.calls[0][2]).toMatchObject({
      strategy: "fixed",
    })
    wrapper.unmount()
  })

  it("places the panel inside a scroll container, as the built-in positioning does", async () => {
    const { container, host } = scrollContainer()
    const lib = anyAnswer()
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

  it("still hides the panel while its trigger is scrolled out of view", async () => {
    const { container, host } = scrollContainer()
    const lib = anyAnswer()
    const wrapper = mount(VPick, {
      props: { options: opts, floatingUi: lib },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    let top = 150
    ;(
      wrapper.find('[role="combobox"]').element as HTMLElement
    ).getBoundingClientRect = () => rectAt(top)
    await wrapper.find('[role="combobox"]').trigger("click")
    await flushPromises()

    const positioner =
      container.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      false,
    )
    top = 40
    container.dispatchEvent(new Event("scroll"))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await flushPromises()
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      true,
    )
    wrapper.unmount()
    container.remove()
  })
})
