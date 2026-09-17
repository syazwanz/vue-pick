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
    flip: vi.fn(() => ({ name: "flip" })),
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
    expect(lib.flip).toHaveBeenCalled()
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
