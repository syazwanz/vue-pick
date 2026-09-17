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

describe("VPick (Vue 2) — floatingUi", () => {
  it("asks Floating UI where the panel goes and applies the answer", async () => {
    const lib = {
      computePosition: vi.fn(() =>
        Promise.resolve({
          x: 12,
          y: 34,
          placement: "top-end",
          strategy: "fixed" as const,
        }),
      ),
      offset: vi.fn((value?: number) => ({ name: "offset", value })),
      flip: vi.fn(() => ({ name: "flip" })),
      shift: vi.fn((options?: { padding: number }) => ({
        name: "shift",
        options,
      })),
    }
    const wrapper = mount(VPick, {
      propsData: {
        options: [{ label: "Todo", value: "todo" }],
        floatingUi: lib,
        align: "end",
      },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await flush()
    await flush()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(lib.computePosition).toHaveBeenCalled()
    expect(lib.shift).toHaveBeenCalledWith({ padding: 8 })
    expect(positioner.style.transform).toBe("translate3d(12px, 34px, 0)")
    expect(positioner.style.position).toBe("fixed")
    expect(positioner.getAttribute("data-placement")).toBe("top")
    wrapper.destroy()
  })
})
