import { describe, it, expect, afterEach, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"

const opts = [
  { label: "Todo", value: "todo" },
  { label: "Done", value: "done" },
]

let listboxWidth = 0
const originalOffsetWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetWidth",
)

beforeEach(() => {
  Object.defineProperty(document.documentElement, "clientWidth", {
    value: 1000,
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

function rect(left: number, width: number): DOMRect {
  return {
    top: 100,
    bottom: 136,
    left,
    right: left + width,
    width,
    height: 36,
    x: left,
    y: 100,
    toJSON: () => ({}),
  } as DOMRect
}

async function openAt(triggerRect: DOMRect, props: Record<string, unknown>) {
  const wrapper = mount(VPick, {
    propsData: { options: opts, strategy: "fixed", ...props },
    attachTo: document.body,
  })
  const trigger = wrapper.find('[role="combobox"]').element as HTMLElement
  trigger.getBoundingClientRect = () => triggerRect
  await wrapper.find('[role="combobox"]').trigger("click")
  await nextTick()
  await nextTick()
  await nextTick()
  const transform =
    document.body.querySelector<HTMLElement>(".vpick-positioner")?.style
      .transform ?? ""
  const match = transform.match(/translate3d\((-?[\d.]+)px, (-?[\d.]+)px/)
  return { wrapper, x: match ? Number(match[1]) : NaN }
}

describe("VPick (Vue 2) — placement sideways", () => {
  it("keeps a wide list on screen next to a trigger at the right edge", async () => {
    listboxWidth = 400
    const { wrapper, x } = await openAt(rect(900, 100), {})
    expect(x).toBe(1000 - 8 - 400)
    wrapper.destroy()
  })

  it("lines up with the trigger's right edge with align end", async () => {
    listboxWidth = 300
    const { wrapper, x } = await openAt(rect(400, 100), { align: "end" })
    expect(x).toBe(200)
    wrapper.destroy()
  })
})
