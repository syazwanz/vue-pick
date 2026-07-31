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

// Scroll repositioning is coalesced into one write per animation frame, so a
// nextTick is not enough to observe it.
function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
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

  // Pins today's `fixed` positioning: the listbox stays teleported to body even
  // when the trigger sits inside a scroll container, and tracks by recomputing
  // viewport coordinates from the trigger's rect.
  //
  // This asserts the panel *follows* the scroll. It does not assert that the
  // panel stays glued to the trigger, and it cannot: JS owns the position here,
  // so it lands a frame behind a compositor-driven scroll. Do not cite this
  // test as evidence that reparenting into the scroll container is unnecessary.
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
    await nextFrame()

    expect(positioner!.style.transform).toBe("translate3d(20px, 80px, 0)")

    // Many events inside one frame collapse into a single reposition. Counting
    // rect reads is what proves it: the end position alone would look identical
    // if every event had been handled separately.
    let reads = 0
    top = 10
    triggerEl.getBoundingClientRect = () => {
      reads++
      return rectAt(top)
    }
    container.dispatchEvent(new Event("scroll"))
    container.dispatchEvent(new Event("scroll"))
    container.dispatchEvent(new Event("scroll"))
    await nextFrame()

    expect(reads).toBe(1)
    expect(positioner!.style.transform).toBe("translate3d(20px, 50px, 0)")

    wrapper.unmount()
    container.remove()
  })
})

describe("VPick — anchoring strategy", () => {
  // A positioned, scrollable ancestor can hold the panel, so the panel is
  // anchored inside it with `absolute`. The point of doing so is that the
  // coordinates stop depending on scroll position: the browser moves the panel
  // with the content, and JS writes nothing per frame.
  function mountInContainer(
    containerStyle: Partial<CSSStyleDeclaration>,
    props: Record<string, unknown> = {},
  ) {
    const container = document.createElement("div")
    Object.assign(container.style, containerStyle)
    document.body.appendChild(container)
    const host = document.createElement("div")
    container.appendChild(host)

    // happy-dom does no layout, so both boxes are driven by hand.
    container.getBoundingClientRect = () =>
      ({ top: 0, bottom: 400, left: 0, right: 300 }) as DOMRect

    const wrapper = mount(VPick, {
      props: { options: opts, ...props },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    return { wrapper, container }
  }

  it("anchors inside a positioned scroll container", async () => {
    const { wrapper, container } = mountInContainer({
      position: "relative",
      overflowY: "auto",
      height: "400px",
    })

    let top = 100
    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(top)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner = container.querySelector<HTMLElement>(".vpick-positioner")
    expect(positioner).not.toBe(null)
    expect(positioner!.parentElement).toBe(container)
    expect(positioner!.style.position).toBe("absolute")

    const before = positioner!.style.transform

    // Scroll the container: the trigger's viewport rect moves up by 60 and
    // scrollTop grows by 60, so the anchored coordinates must not change. This
    // is the whole reason for anchoring, expressed as an assertion.
    top = 40
    container.scrollTop = 60
    container.dispatchEvent(new Event("scroll"))
    await nextFrame()

    expect(positioner!.style.transform).toBe(before)

    wrapper.unmount()
    container.remove()
  })

  it("stays on fixed in body when the scroll container cannot anchor it", async () => {
    // Scrollable but `position: static`, so it establishes no containing block.
    const { wrapper, container } = mountInContainer({
      overflowY: "auto",
      height: "400px",
    })

    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(100)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")
    expect(positioner!.parentElement).toBe(document.body)
    expect(positioner!.style.position).toBe("fixed")

    wrapper.unmount()
    container.remove()
  })

  it("a static container with a transform can anchor after all", async () => {
    const { wrapper, container } = mountInContainer({
      overflowY: "auto",
      height: "400px",
      transform: "translateZ(0)",
    })

    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(100)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner = container.querySelector<HTMLElement>(".vpick-positioner")
    expect(positioner!.parentElement).toBe(container)
    expect(positioner!.style.position).toBe("absolute")

    wrapper.unmount()
    container.remove()
  })

  it('strategy="fixed" opts out and reproduces the old behavior', async () => {
    const { wrapper, container } = mountInContainer(
      { position: "relative", overflowY: "auto", height: "400px" },
      { strategy: "fixed" },
    )

    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(100)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")
    expect(positioner!.parentElement).toBe(document.body)
    expect(positioner!.style.position).toBe("fixed")

    wrapper.unmount()
    container.remove()
  })
})

describe("VPick — explicit strategy", () => {
  // `auto` refuses a container it cannot anchor to. `absolute` is an explicit
  // decision, so it anchors anyway and gives the container what it needs.
  it("absolute anchors to a static container by promoting it", async () => {
    const container = document.createElement("div")
    container.style.overflowY = "auto"
    document.body.appendChild(container)
    container.getBoundingClientRect = () =>
      ({ top: 0, bottom: 400, left: 0, right: 300 }) as DOMRect
    const host = document.createElement("div")
    container.appendChild(host)

    const wrapper = mount(VPick, {
      props: { options: opts, strategy: "absolute" },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(100)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner = container.querySelector<HTMLElement>(".vpick-positioner")
    expect(positioner!.parentElement).toBe(container)
    expect(positioner!.style.position).toBe("absolute")
    expect(container.style.position).toBe("relative")

    wrapper.unmount()
    // The container is handed back exactly as it was found.
    expect(container.style.position).toBe("")
    container.remove()
  })

  it("restores only after the last instance releases", async () => {
    const container = document.createElement("div")
    container.style.overflowY = "auto"
    document.body.appendChild(container)
    container.getBoundingClientRect = () =>
      ({ top: 0, bottom: 400, left: 0, right: 300 }) as DOMRect
    const hostA = document.createElement("div")
    const hostB = document.createElement("div")
    container.append(hostA, hostB)

    const mk = (host: HTMLElement) => {
      const w = mount(VPick, {
        props: { options: opts, strategy: "absolute" },
        attachTo: host,
        global: { stubs: { Teleport: false } },
      })
      ;(
        w.find('[role="combobox"]').element as HTMLElement
      ).getBoundingClientRect = () => rectAt(100)
      return w
    }
    const a = mk(hostA)
    const b = mk(hostB)
    await a.find('[role="combobox"]').trigger("click")
    await b.find('[role="combobox"]').trigger("click")
    await nextTick()

    expect(container.style.position).toBe("relative")
    a.unmount()
    // Still held by b.
    expect(container.style.position).toBe("relative")
    b.unmount()
    expect(container.style.position).toBe("")
    container.remove()
  })

  it("keeps an inline position that was already there", async () => {
    const container = document.createElement("div")
    container.style.overflowY = "auto"
    container.style.position = "sticky"
    document.body.appendChild(container)
    container.getBoundingClientRect = () =>
      ({ top: 0, bottom: 400, left: 0, right: 300 }) as DOMRect
    const host = document.createElement("div")
    container.appendChild(host)

    const wrapper = mount(VPick, {
      props: { options: opts, strategy: "absolute" },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    ;(
      wrapper.find('[role="combobox"]').element as HTMLElement
    ).getBoundingClientRect = () => rectAt(100)
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    // Already positioned, so it is left alone rather than overwritten.
    expect(container.style.position).toBe("sticky")
    wrapper.unmount()
    expect(container.style.position).toBe("sticky")
    container.remove()
  })

  it("positions relative to an explicit teleport target", async () => {
    const target = document.createElement("div")
    target.id = "explicit-target"
    target.style.position = "relative"
    document.body.appendChild(target)
    target.getBoundingClientRect = () =>
      ({ top: 500, bottom: 900, left: 300, right: 600 }) as DOMRect

    const wrapper = mount(VPick, {
      props: {
        options: opts,
        teleportTo: "#explicit-target",
        strategy: "absolute",
      },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    ;(
      wrapper.find('[role="combobox"]').element as HTMLElement
    ).getBoundingClientRect = () => rectAt(100)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner = target.querySelector<HTMLElement>(".vpick-positioner")
    expect(positioner).not.toBe(null)
    // Coordinates must be relative to the target, not the viewport: the trigger
    // sits at viewport y=136, the target's box starts at y=500.
    expect(positioner!.style.transform).toBe("translate3d(-280px, -360px, 0)")

    wrapper.unmount()
    target.remove()
  })
})
