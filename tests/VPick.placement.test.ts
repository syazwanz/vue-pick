import { describe, it, expect, afterEach, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import VPick from "../src/vue3/VPick.vue"

// Sideways placement, alignment and the trigger gap. Run with the real
// Teleport and `strategy: "fixed"`, so the transform is plain viewport
// coordinates. The test environment has no layout, so sizes are set by hand.

const opts = [
  { label: "Todo", value: "todo" },
  { label: "Done", value: "done" },
]

const VIEWPORT_WIDTH = 1000
let listboxWidth = 0
const originalOffsetWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetWidth",
)

beforeEach(() => {
  Object.defineProperty(document.documentElement, "clientWidth", {
    value: VIEWPORT_WIDTH,
    configurable: true,
  })
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return (this as HTMLElement).classList.contains("vpick-listbox")
        ? listboxWidth
        : 0
    },
  })
})

afterEach(() => {
  if (originalOffsetWidth) {
    Object.defineProperty(
      HTMLElement.prototype,
      "offsetWidth",
      originalOffsetWidth,
    )
  }
  document.body
    .querySelectorAll('.vpick-positioner, [role="listbox"]')
    .forEach((n) => n.remove())
})

function rect(left: number, width: number, top = 100): DOMRect {
  return {
    top,
    bottom: top + 36,
    left,
    right: left + width,
    width,
    height: 36,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

async function openAt(
  triggerRect: DOMRect,
  props: Record<string, unknown> = {},
  rootStyle = "",
) {
  const wrapper = mount(VPick, {
    props: { options: opts, strategy: "fixed", ...props },
    attrs: rootStyle ? { style: rootStyle } : {},
    attachTo: document.body,
    global: { stubs: { Teleport: false } },
  })
  const trigger = wrapper.find('[role="combobox"]').element as HTMLElement
  trigger.getBoundingClientRect = () => triggerRect
  await wrapper.find('[role="combobox"]').trigger("click")
  await nextTick()
  await nextTick()
  const positioner =
    document.body.querySelector<HTMLElement>(".vpick-positioner")
  const match = positioner?.style.transform.match(
    /translate3d\((-?[\d.]+)px, (-?[\d.]+)px/,
  )
  return {
    wrapper,
    x: match ? Number(match[1]) : NaN,
    y: match ? Number(match[2]) : NaN,
  }
}

describe("VPick — placement sideways", () => {
  it("keeps a wide list on screen next to a trigger at the right edge", async () => {
    listboxWidth = 400
    const { wrapper, x } = await openAt(rect(900, 100))
    expect(x).toBe(VIEWPORT_WIDTH - 8 - 400)
    wrapper.unmount()
  })

  it("lines up with the trigger's left edge by default", async () => {
    listboxWidth = 300
    const { wrapper, x } = await openAt(rect(400, 100))
    expect(x).toBe(400)
    wrapper.unmount()
  })

  it("lines up with the trigger's right edge with align end", async () => {
    listboxWidth = 300
    const { wrapper, x } = await openAt(rect(400, 100), { align: "end" })
    expect(x).toBe(500 - 300)
    wrapper.unmount()
  })

  it("follows a right-to-left writing direction", async () => {
    listboxWidth = 300
    const { wrapper, x } = await openAt(rect(400, 100), {}, "direction: rtl")
    expect(x).toBe(500 - 300)
    wrapper.unmount()
  })
})

describe("VPick — gap between trigger and list", () => {
  it("defaults to 4px", async () => {
    listboxWidth = 100
    const { wrapper, y } = await openAt(rect(100, 100))
    expect(y).toBe(136 + 4)
    wrapper.unmount()
  })

  it("reads --vpick-listbox-offset in px", async () => {
    listboxWidth = 100
    const { wrapper, y } = await openAt(
      rect(100, 100),
      {},
      "--vpick-listbox-offset: 20px",
    )
    expect(y).toBe(136 + 20)
    wrapper.unmount()
  })

  it("reads --vpick-listbox-offset in rem", async () => {
    listboxWidth = 100
    document.documentElement.style.fontSize = "16px"
    const { wrapper, y } = await openAt(
      rect(100, 100),
      {},
      "--vpick-listbox-offset: 0.5rem",
    )
    expect(y).toBe(136 + 8)
    wrapper.unmount()
    document.documentElement.style.fontSize = ""
  })
})
