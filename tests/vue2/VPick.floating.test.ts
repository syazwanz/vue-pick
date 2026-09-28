import { describe, it, expect, vi, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"

afterEach(() => {
  document.body
    .querySelectorAll('.vpick-positioner, [role="listbox"]')
    .forEach((n) => n.remove())
})

async function flush() {
  await new Promise((r) => setImmediate(r))
  await nextTick()
}

type Result = {
  x: number
  y: number
  placement: string
  strategy: "absolute" | "fixed"
  middlewareData?: { hide?: { referenceHidden?: boolean } }
}

// `autoUpdate` runs the first update straight away, as the real one does, and
// keeps the callback so a test can fire later ones.
function fakeLibrary(answer: () => Result) {
  const stop = vi.fn()
  let update: () => void = () => {}
  return {
    stop,
    runUpdate: () => update(),
    computePosition: vi.fn(() => Promise.resolve(answer())),
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

async function openWith(
  lib: ReturnType<typeof fakeLibrary>,
  props: Record<string, unknown> = {},
) {
  const wrapper = mount(VPick, {
    propsData: {
      options: [{ label: "Todo", value: "todo" }],
      floatingUi: lib,
      ...props,
    },
    attachTo: document.body,
  })
  await wrapper.find('[role="combobox"]').trigger("click")
  await flush()
  await flush()
  const positioner =
    document.body.querySelector<HTMLElement>(".vpick-positioner")!
  return { wrapper, positioner }
}

describe("VPick (Vue 2) — floatingUi", () => {
  it("asks Floating UI where the panel goes and applies the answer", async () => {
    const lib = fakeLibrary(() => ({
      x: 12,
      y: 34,
      placement: "top-end",
      strategy: "fixed",
    }))
    const { wrapper, positioner } = await openWith(lib, { align: "end" })

    expect(lib.computePosition).toHaveBeenCalled()
    expect(lib.flip).toHaveBeenCalledWith()
    expect(lib.shift).toHaveBeenCalledWith({ padding: 8 })
    expect(lib.hide).toHaveBeenCalledWith()
    expect(positioner.style.transform).toBe("translate3d(12px, 34px, 0)")
    expect(positioner.style.position).toBe("fixed")
    expect(positioner.getAttribute("data-placement")).toBe("top")
    wrapper.destroy()
  })

  it("hands the timing to autoUpdate and stops it on close", async () => {
    const lib = fakeLibrary(() => ({
      x: 0,
      y: 0,
      placement: "bottom-start",
      strategy: "absolute",
    }))
    const { wrapper, positioner } = await openWith(lib)

    expect(lib.autoUpdate).toHaveBeenCalledTimes(1)
    const args = lib.autoUpdate.mock.calls[0]
    expect(args[0]).toBe(wrapper.find('[role="combobox"]').element)
    expect(args[1]).toBe(positioner)
    expect(args).toHaveLength(3)

    window.dispatchEvent(new Event("scroll"))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await flush()
    expect(lib.computePosition).toHaveBeenCalledTimes(1)

    await wrapper.find('[role="combobox"]').trigger("click")
    await flush()
    expect(lib.stop).toHaveBeenCalledTimes(1)
    wrapper.destroy()
  })

  it("hides the panel while Floating UI reports the trigger hidden", async () => {
    let hidden = true
    const lib = fakeLibrary(() => ({
      x: 0,
      y: 0,
      placement: "bottom-start",
      strategy: "absolute",
      middlewareData: { hide: { referenceHidden: hidden } },
    }))
    const { wrapper, positioner } = await openWith(lib)
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      true,
    )

    hidden = false
    lib.runUpdate()
    await flush()
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      false,
    )
    wrapper.destroy()
  })
})
