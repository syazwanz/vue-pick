import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { VPick } from "../src/vue3"
import { resetIdCounter } from "../src/core"

// jsdom has no layout, so the list is faked: a 100px viewport of 32px rows
// inside a group padded by 4px. `scale` stands in for the open animation,
// which shrinks every rect the list reports while it plays.
const VIEW = 100
const ROW = 32
const PAD = 4
let scale = 1

const options = Array.from({ length: 20 }, (_, i) => ({
  label: `Option ${i}`,
  value: i,
}))

const scrollTops = new WeakMap<Element, number>()
const saved = {
  rect: Element.prototype.getBoundingClientRect,
  clientHeight: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientHeight",
  ),
  offsetHeight: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetHeight",
  ),
  scrollTop: Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop"),
}
let style: HTMLStyleElement

const isListbox = (el: Element) => el.classList.contains("vpick-listbox")

function rect(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    height,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

beforeEach(() => {
  resetIdCounter()
  scale = 1
  style = document.createElement("style")
  style.textContent = `.vpick-group { padding: ${PAD}px; }`
  document.head.appendChild(style)
  Element.prototype.getBoundingClientRect = function (this: Element) {
    if (isListbox(this)) return rect(0, VIEW * scale)
    const lb = this.closest(".vpick-listbox")
    if (lb && this.getAttribute("role") === "option") {
      const i = [...lb.querySelectorAll('[role="option"]')].indexOf(this)
      return rect((PAD + i * ROW - lb.scrollTop) * scale, ROW * scale)
    }
    return rect(0, 0)
  }
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return isListbox(this) ? VIEW : 0
    },
  })
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return isListbox(this) ? VIEW : 0
    },
  })
  Object.defineProperty(Element.prototype, "scrollTop", {
    configurable: true,
    get() {
      return scrollTops.get(this) ?? 0
    },
    set(v: number) {
      scrollTops.set(this, v)
    },
  })
})

afterEach(() => {
  style.remove()
  Element.prototype.getBoundingClientRect = saved.rect
  for (const [proto, key] of [
    [HTMLElement.prototype, "clientHeight"],
    [HTMLElement.prototype, "offsetHeight"],
    [Element.prototype, "scrollTop"],
  ] as const) {
    const d = saved[key]
    if (d) Object.defineProperty(proto, key, d)
    else delete (proto as unknown as Record<string, unknown>)[key]
  }
})

const settle = () => new Promise((r) => setTimeout(r))

function listbox() {
  return document.querySelector<HTMLElement>('[role="listbox"]')!
}

describe("VPick — scrolling the highlight into view", () => {
  it("leaves the group padding below the highlight when scrolling down", async () => {
    const wrapper = mount(VPick, {
      props: { options },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await settle()
    for (let i = 0; i < 3; i++) {
      await trigger.trigger("keydown", { key: "ArrowDown" })
    }
    await settle()
    // Option 3 ends at 4 + 4 * 32 = 132, plus 4px of padding below it.
    expect(listbox().scrollTop).toBe(132 + PAD - VIEW)
    wrapper.unmount()
  })

  it("leaves the group padding above the highlight when scrolling up", async () => {
    const wrapper = mount(VPick, {
      props: { options, modelValue: 10 },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await settle()
    for (let i = 0; i < 4; i++) {
      await trigger.trigger("keydown", { key: "ArrowUp" })
    }
    await settle()
    // Option 6 starts at 4 + 6 * 32 = 196, minus 4px of padding above it.
    expect(listbox().scrollTop).toBe(196 - PAD)
    wrapper.unmount()
  })

  it("reaches a deep selection while the open animation scales the list", async () => {
    scale = 0.95
    const wrapper = mount(VPick, {
      props: { options, modelValue: 15 },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await settle()
    // Option 15 ends at 4 + 16 * 32 = 516, plus 4px of padding below it.
    expect(listbox().scrollTop).toBeCloseTo(516 + PAD - VIEW)
    wrapper.unmount()
  })

  it("scrolls again once the list has been placed", async () => {
    const wrapper = mount(VPick, {
      props: { options, modelValue: 15 },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    // Push the selection further down after the first scroll, the way labels
    // wrapping in the narrowed list do, and before placement settles.
    const lb = listbox()
    const first = lb.scrollTop
    const extra = 200
    const base = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const r = base.call(this)
      if (this.getAttribute("role") !== "option") return r
      return rect(r.top + extra, r.height)
    }
    await settle()
    expect(lb.scrollTop).toBe(first + extra)
    wrapper.unmount()
  })
})
