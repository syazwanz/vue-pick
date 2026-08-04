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

function setScrollY(y: number): void {
  Object.defineProperty(window, "scrollY", {
    value: y,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  // Clean any teleported nodes left in body between tests. The positioner is
  // the wrapper the listbox sits inside, so removing only the listbox leaves
  // empty positioners behind and a later `querySelector` picks up a stale one.
  document.body
    .querySelectorAll('.vpick-positioner, [role="listbox"]')
    .forEach((n) => n.remove())
  setScrollY(0)
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

  // Scoped CSS cannot reach the panel once it is teleported, since the
  // [data-v-hash] ancestor the compiler relies on is no longer above it. The
  // forwarding list is therefore the only channel a caller has for theming one
  // instance rather than every instance on the page, which makes a variable
  // that is missing from it effectively unsettable.
  it("forwards option row variables to the teleported panel", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts },
      attrs: {
        style:
          "--vpick-option-padding-block: 0.5rem; --vpick-option-branch-padding-block: 0.75rem; --vpick-option-branch-weight: 700",
      },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")
    expect(positioner).not.toBe(null)
    const style = positioner!.getAttribute("style") ?? ""
    expect(style).toContain("--vpick-option-padding-block: 0.5rem")
    expect(style).toContain("--vpick-option-branch-padding-block: 0.75rem")
    expect(style).toContain("--vpick-option-branch-weight: 700")
    wrapper.unmount()
  })

  it("forwards the selected-row variables to the teleported panel", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts },
      attrs: {
        style:
          "--vpick-option-selected-bg: #e3f2fd; --vpick-option-selected-weight: 600",
      },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const style =
      document.body
        .querySelector<HTMLElement>(".vpick-positioner")
        ?.getAttribute("style") ?? ""
    expect(style).toContain("--vpick-option-selected-bg: #e3f2fd")
    expect(style).toContain("--vpick-option-selected-weight: 600")
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

  // Nothing between the trigger and the root scrolls here, so the page is the
  // scroll container. Document coordinates do not change as it scrolls, which
  // means the browser moves the panel and JS has nothing to chase. That
  // invariance is the fix, and it is the part a unit test can prove: happy-dom
  // cannot composite a scroll, so it cannot show the lag being removed.
  it("keeps the computed position unchanged when the page scrolls", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })

    let top = 100
    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(top)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.style.position).toBe("absolute")
    const before = positioner.style.transform
    expect(before).toMatch(/translate3d\(/)

    // Scroll the page 60px. The trigger's viewport rect moves up by exactly
    // that much, so the document coordinate is the same number as before.
    top = 40
    setScrollY(60)
    window.dispatchEvent(new Event("scroll"))
    await nextFrame()

    expect(positioner.style.transform).toBe(before)
    wrapper.unmount()
  })

  // The escape hatch has to keep behaving the way it did before, including the
  // part that made it lag, or `strategy="fixed"` is not a way back.
  it("strategy=fixed still repositions against the viewport on page scroll", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts, strategy: "fixed" as const },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })

    let top = 100
    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(top)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.style.position).toBe("fixed")
    expect(positioner.style.transform).toBe("translate3d(20px, 140px, 0)")

    top = 40
    setScrollY(60)
    window.dispatchEvent(new Event("scroll"))
    await nextFrame()

    expect(positioner.style.transform).toBe("translate3d(20px, 80px, 0)")
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

  // Anchoring assumes the trigger travels with the container. A `position:
  // fixed` ancestor in between breaks that: the container scrolls, the trigger
  // does not, and the panel would slide away from a trigger that never moved,
  // which is the trailing `absolute` exists to prevent. `fixed` has nothing to
  // chase there, so it is the better answer and is picked without being asked.
  it("stays fixed when a pinned ancestor sits between trigger and container", async () => {
    const container = document.createElement("div")
    Object.assign(container.style, {
      position: "relative",
      overflowY: "auto",
      height: "400px",
    })
    document.body.appendChild(container)
    const pinned = document.createElement("div")
    pinned.style.position = "fixed"
    container.appendChild(pinned)
    const host = document.createElement("div")
    pinned.appendChild(host)

    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.style.position).toBe("fixed")
    expect(container.querySelector(".vpick-positioner")).toBe(null)

    wrapper.unmount()
    container.remove()
  })

  // The scroll lock swallows wheel input aimed at the locked scroller instead
  // of hiding its scrollbar, so layout never changes and nothing sized against
  // the viewport can shift. Anchored inside a scroll container, the lock lands
  // on the container: a body lock would leave it free to scroll. This is why
  // the lock is decided after the anchor is resolved, not before.
  it("locks the anchor container instead of the body", async () => {
    const { wrapper, container } = mountInContainer({
      position: "relative",
      overflowY: "auto",
      height: "400px",
    })
    // happy-dom does no layout, so the container's scrollability is staged.
    Object.defineProperty(container, "scrollHeight", { value: 800 })
    Object.defineProperty(container, "clientHeight", { value: 400 })

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const wheelOn = (target: Element) => {
      const e = new Event("wheel", { bubbles: true, cancelable: true })
      target.dispatchEvent(e)
      return e.defaultPrevented
    }
    expect(wheelOn(container.querySelector("div")!)).toBe(true)
    expect(wheelOn(document.body)).toBe(false)
    expect(container.style.overflow).not.toBe("hidden")

    // Escape closes and must hand the container back.
    await wrapper.find('[role="combobox"]').trigger("keydown", {
      key: "Escape",
    })
    expect(wheelOn(container.querySelector("div")!)).toBe(false)

    wrapper.unmount()
    container.remove()
  })

  // With no anchor the page is the scroller, so the body keeps the lock. Pins
  // the default that existed before element locks did.
  it("locks the body when nothing else scrolls", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const wheelOn = () => {
      const e = new Event("wheel", { bubbles: true, cancelable: true })
      document.body.dispatchEvent(e)
      return e.defaultPrevented
    }
    expect(wheelOn()).toBe(true)
    expect(document.body.style.overflow).not.toBe("hidden")

    await wrapper.find('[role="combobox"]').trigger("keydown", {
      key: "Escape",
    })
    expect(wheelOn()).toBe(false)
    wrapper.unmount()
  })

  // A pinned trigger with no scrollable ancestor would otherwise take the
  // page-anchoring branch, and the page is exactly what it does not travel
  // with: the page scrolls, the trigger stays, the panel drifts. Same bug as
  // the in-container case, one branch earlier.
  it("stays fixed for a pinned trigger with no scroll ancestor", async () => {
    const pinned = document.createElement("div")
    pinned.style.position = "fixed"
    document.body.appendChild(pinned)
    const host = document.createElement("div")
    pinned.appendChild(host)

    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.style.position).toBe("fixed")

    wrapper.unmount()
    pinned.remove()
  })

  // The scroller itself being pinned is the same case: a modal overlay is
  // `position: fixed` and becomes the scroll container once its content
  // overflows. Anchoring into it parents the panel into a pinned subtree, and
  // whether that subtree is the scroller at all flips with content height, so
  // it resolves `fixed` like every other pinned trigger.
  it("stays fixed when the scroll container itself is pinned", async () => {
    const modal = document.createElement("div")
    Object.assign(modal.style, {
      position: "fixed",
      overflowY: "auto",
      height: "400px",
    })
    document.body.appendChild(modal)
    const host = document.createElement("div")
    modal.appendChild(host)

    const wrapper = mount(VPick, {
      props: { options: opts, strategy: "absolute" as const },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.style.position).toBe("fixed")
    expect(modal.querySelector(".vpick-positioner")).toBe(null)

    wrapper.unmount()
    modal.remove()
  })

  // The one case where an explicit `strategy="absolute"` does not win. It
  // normally does, because the caller is choosing a tradeoff. A pinned trigger
  // cannot trail, so anchoring has nothing to offer and only adds drift, which
  // makes the prop a request that cannot help rather than a preference.
  it("outranks an explicit absolute when the trigger is pinned", async () => {
    const container = document.createElement("div")
    Object.assign(container.style, {
      position: "relative",
      overflowY: "auto",
      height: "400px",
    })
    document.body.appendChild(container)
    const pinned = document.createElement("div")
    pinned.style.position = "fixed"
    container.appendChild(pinned)
    const host = document.createElement("div")
    pinned.appendChild(host)

    const wrapper = mount(VPick, {
      props: { options: opts, strategy: "absolute" as const },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.style.position).toBe("fixed")
    expect(container.querySelector(".vpick-positioner")).toBe(null)
    // The container is never promoted either, so no inline style is left on the
    // caller's DOM for a strategy that was not used.
    expect(container.style.position).toBe("relative")

    wrapper.unmount()
    container.remove()
  })

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

describe("VPick — hideWhenDetached", () => {
  // The panel is hidden, not closed, so selection and focus survive scrolling
  // back to the trigger.
  function openInContainer(props: Record<string, unknown> = {}) {
    const container = document.createElement("div")
    container.style.overflowY = "auto"
    document.body.appendChild(container)
    container.getBoundingClientRect = () =>
      ({ top: 100, bottom: 300, left: 0, right: 300 }) as DOMRect
    const host = document.createElement("div")
    container.appendChild(host)

    const wrapper = mount(VPick, {
      props: { options: opts, ...props },
      attachTo: host,
      global: { stubs: { Teleport: false } },
    })
    return { wrapper, container }
  }

  it("hides once the trigger is clipped by its scroll container", async () => {
    const { wrapper, container } = openInContainer()
    let top = 150 // inside the container's 100..300 band
    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(top)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      false,
    )

    // Scroll the trigger fully above the container.
    top = 40
    container.dispatchEvent(new Event("scroll"))
    await nextFrame()
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      true,
    )

    // Hidden, not closed: the listbox is still mounted, so selection, focus
    // and any search query survive scrolling back.
    expect(document.body.querySelector('[role="listbox"]')).not.toBe(null)

    // Scrolling back reveals it again.
    top = 150
    container.dispatchEvent(new Event("scroll"))
    await nextFrame()
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      false,
    )

    wrapper.unmount()
    container.remove()
  })

  it("stays visible when hideWhenDetached is off", async () => {
    const { wrapper, container } = openInContainer({ hideWhenDetached: false })
    let top = 150
    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(top)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    top = 40
    container.dispatchEvent(new Event("scroll"))
    await nextFrame()

    const positioner =
      document.body.querySelector<HTMLElement>(".vpick-positioner")!
    expect(positioner.classList.contains("vpick-positioner--detached")).toBe(
      false,
    )

    wrapper.unmount()
    container.remove()
  })
})
