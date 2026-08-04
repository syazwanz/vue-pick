import { describe, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"
import { resetIdCounter, type OptionOrGroup } from "../../src/core"

// In its own file on purpose: the scroll lock is refcounted global state, and
// the main suite leaves dropdowns open, so locks arrive there already held. A
// fresh environment is the only way to assert absolute lock state.

const status: OptionOrGroup[] = [
  { label: "Todo", value: "todo" },
  { label: "Done", value: "done" },
]

function wheelOn(target: Element): boolean {
  const e = new Event("wheel", { bubbles: true, cancelable: true })
  target.dispatchEvent(e)
  return e.defaultPrevented
}

beforeEach(() => {
  resetIdCounter()
})

describe("VPick (Vue 2) — scroll lock", () => {
  // The scroll lock swallows wheel input aimed at the locked scroller instead
  // of hiding its scrollbar, so layout never changes and nothing sized against
  // the viewport can shift. Anchored inside a scroll container, the lock lands
  // on the container: a body lock would leave it free to scroll. This is why
  // the lock is decided after the anchor is resolved, not before.
  it("locks the anchor container instead of the body", async () => {
    const container = document.createElement("div")
    Object.assign(container.style, {
      position: "relative",
      overflowY: "auto",
      height: "400px",
    })
    document.body.appendChild(container)
    const host = document.createElement("div")
    container.appendChild(host)
    container.getBoundingClientRect = () =>
      ({ top: 0, bottom: 400, left: 0, right: 300 }) as DOMRect
    // happy-dom does no layout, so the container's scrollability is staged.
    Object.defineProperty(container, "scrollHeight", { value: 800 })
    Object.defineProperty(container, "clientHeight", { value: 400 })

    const wrapper = mount(VPick, {
      propsData: { options: status },
      attachTo: host,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    expect(wheelOn(wrapper.element)).toBe(true)
    expect(wheelOn(document.body)).toBe(false)
    expect(container.style.overflow).not.toBe("hidden")

    // Escape closes and must hand the container back.
    await wrapper.find('[role="combobox"]').trigger("keydown", {
      key: "Escape",
    })
    expect(wheelOn(wrapper.element)).toBe(false)

    wrapper.destroy()
    container.remove()
  })

  // With no anchor the page is the scroller, so the body keeps the lock. Pins
  // the default that existed before element locks did.
  it("locks the body when nothing else scrolls", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    expect(wheelOn(document.body)).toBe(true)
    expect(document.body.style.overflow).not.toBe("hidden")

    await wrapper.find('[role="combobox"]').trigger("keydown", {
      key: "Escape",
    })
    expect(wheelOn(document.body)).toBe(false)
    wrapper.destroy()
  })
})
