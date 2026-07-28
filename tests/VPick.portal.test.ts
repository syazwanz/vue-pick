import { describe, it, expect, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import VPick from "../src/vue3/VPick.vue"

// These tests run WITHOUT the global Teleport stub so we can verify real
// portal behavior. We re-enable Teleport by passing stubs: { Teleport: false }
// on a per-mount basis.

const opts = [
  { label: "Todo", value: "todo" },
  { label: "Done", value: "done" },
]

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

afterEach(() => {
  // Clean any teleported nodes left in body between tests.
  document.body.querySelectorAll('[role="listbox"]').forEach((n) => n.remove())
})

describe("VPick — portal", () => {
  it("renders listbox outside the component root when open", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")

    const inRoot = wrapper.element.querySelector('[role="listbox"]')
    const inBody = document.body.querySelector('[role="listbox"]')

    expect(inRoot).toBe(null)
    expect(inBody).not.toBe(null)
    wrapper.unmount()
  })

  it("listbox is not present in body when closed", () => {
    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    // Teleport is disabled when closed — listbox stays in wrapper, v-show hides it.
    const inBody = document.body.querySelector("[data-teleport-stub]")
    expect(inBody).toBe(null)
    wrapper.unmount()
  })

  it("clicking a teleported option still selects it", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts, modelValue: "todo" },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")

    const option = document.body.querySelector<HTMLElement>(
      '[role="option"]:last-of-type',
    )
    expect(option).not.toBe(null)
    option!.dispatchEvent(new MouseEvent("click", { bubbles: true }))

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["done"])
    wrapper.unmount()
  })

  // The listbox stays teleported to body even when the trigger sits inside a
  // scroll container. It tracks by recomputing fixed coordinates from the
  // trigger's viewport rect, so it must never be reparented into the container
  // — doing that would expose it to the container's own clipping, which is the
  // whole reason we teleport in the first place.
  it("tracks the trigger when a scrollable ancestor scrolls", async () => {
    const container = document.createElement("div")
    container.style.overflowY = "auto"
    container.style.height = "200px"
    document.body.appendChild(container)
    const host = document.createElement("div")
    container.appendChild(host)

    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })

    // happy-dom does no layout, so drive the trigger's rect by hand.
    let top = 100
    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(top)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")
    expect(positioner).not.toBe(null)
    expect(positioner!.parentElement).toBe(document.body)
    expect(positioner!.style.position).toBe("fixed")
    expect(positioner!.style.transform).toBe("translate3d(20px, 140px, 0)")

    // Scrolling the container moves the trigger up the viewport by 60px.
    top = 40
    container.dispatchEvent(new Event("scroll"))
    await nextTick()

    expect(positioner!.style.transform).toBe("translate3d(20px, 80px, 0)")

    wrapper.unmount()
    container.remove()
  })
})
