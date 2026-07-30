import { describe, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"
import { resetIdCounter, type OptionOrGroup } from "../../src/core"

const status: OptionOrGroup[] = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]

const withDisabled: OptionOrGroup[] = [
  { label: "A", value: "a" },
  { label: "B", value: "b", disabled: true },
  { label: "C", value: "c" },
]

const grouped: OptionOrGroup[] = [
  {
    label: "Fruits",
    options: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
    ],
  },
  {
    label: "Veggies",
    options: [
      { label: "Carrot", value: "carrot" },
      { label: "Daikon", value: "daikon" },
    ],
  },
]

const disabledGroup: OptionOrGroup[] = [
  {
    label: "Available",
    options: [{ label: "One", value: "one" }],
  },
  {
    label: "Blocked",
    disabled: true,
    options: [
      { label: "Two", value: "two" },
      { label: "Three", value: "three" },
    ],
  },
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

beforeEach(() => {
  resetIdCounter()
})

describe("VPick (Vue 2) — rendering", () => {
  it("renders a combobox trigger button", () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes("aria-haspopup")).toBe("listbox")
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("shows placeholder when no value selected", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, placeholder: "Pick one" },
    })
    expect(wrapper.find(".vpick-trigger-placeholder").text()).toBe("Pick one")
  })

  it("shows selected label when value is set", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, value: "in-progress" },
    })
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("In Progress")
  })

  it("resolves label from a grouped option", () => {
    const wrapper = mount(VPick, {
      propsData: { options: grouped, value: "carrot" },
    })
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("Carrot")
  })

  it("listbox is hidden by default", () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner")
    expect(positioner.element.style.display).toBe("none")
  })

  it("positioner wraps the listbox", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner")
    const listbox = positioner.find<HTMLElement>('[role="listbox"]')
    expect(positioner.exists()).toBe(true)
    expect(listbox.exists()).toBe(true)
    expect(positioner.element.contains(listbox.element)).toBe(true)
    wrapper.destroy()
  })

  it("positioner uses translate3d for positioning", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner")
    expect(positioner.element.style.transform).toMatch(/translate3d\(/)
    expect(positioner.element.style.position).toBe("fixed")
    wrapper.destroy()
  })

  it("data-placement attribute lives on the positioner, not the listbox", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner")
    const listbox = wrapper.find<HTMLElement>('[role="listbox"]')
    expect(positioner.attributes("data-placement")).toBeDefined()
    expect(listbox.attributes("data-placement")).toBeUndefined()
    wrapper.destroy()
  })

  // The listbox stays attached to body even when the trigger sits inside a
  // scroll container, and tracks by recomputing viewport coordinates from the
  // trigger's rect.
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
      propsData: { options: status },
      attachTo: host,
    })

    // happy-dom does no layout, so drive the trigger's rect by hand.
    let top = 100
    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement
    triggerEl.getBoundingClientRect = () => rectAt(top)

    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()

    const positioner = wrapper.find<HTMLElement>(".vpick-positioner").element
    expect(positioner.parentElement).toBe(document.body)
    expect(positioner.style.position).toBe("fixed")
    expect(positioner.style.transform).toBe("translate3d(20px, 140px, 0)")

    // Scrolling the container moves the trigger up the viewport by 60px.
    top = 40
    container.dispatchEvent(new Event("scroll"))
    await nextFrame()

    expect(positioner.style.transform).toBe("translate3d(20px, 80px, 0)")

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
    expect(positioner.style.transform).toBe("translate3d(20px, 50px, 0)")

    wrapper.destroy()
    container.remove()
  })

  it("uses a custom id when provided", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, id: "my-pick" },
    })
    expect(wrapper.find('[role="combobox"]').attributes("id")).toBe("my-pick")
    expect(wrapper.find('[role="listbox"]').attributes("id")).toBe(
      "my-pick-listbox",
    )
  })
})

describe("VPick (Vue 2) — opening / closing", () => {
  it("opens listbox on click", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="listbox"]').isVisible()).toBe(true)
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "true",
    )
  })

  it("toggles closed on second click", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("closes when Escape is pressed", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("keydown", { key: "Escape" })
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("closes on document mousedown outside root", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
    wrapper.destroy()
  })
})

describe("VPick (Vue 2) — keyboard navigation", () => {
  it("ArrowDown opens listbox and highlights first enabled", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    expect(wrapper.find('[role="listbox"]').isVisible()).toBe(true)
    const highlighted = wrapper.find(".vpick-option--highlighted")
    expect(highlighted.exists()).toBe(true)
    expect(highlighted.text()).toContain("Todo")
  })

  it("ArrowDown cycles through enabled options", async () => {
    const wrapper = mount(VPick, { propsData: { options: withDisabled } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowDown" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("C")
  })

  it("ArrowUp moves highlight backwards", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowUp" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("Todo")
  })

  it("Home jumps to first enabled", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "End" })
    await trigger.trigger("keydown", { key: "Home" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("Todo")
  })

  it("End jumps to last enabled", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("keydown", { key: "End" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("Done")
  })

  it("Enter selects highlighted", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "Enter" })
    expect(wrapper.emitted("input")![0]).toEqual(["in-progress"])
  })

  it("Space selects highlighted", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: " " })
    expect(wrapper.emitted("input")![0]).toEqual(["todo"])
  })
})

describe("VPick (Vue 2) — selection", () => {
  it("emits input on click (Vue 2 v-model)", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(1).trigger("click")
    expect(wrapper.emitted("input")![0]).toEqual(["in-progress"])
  })

  it("closes after selecting", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
  })

  it("marks selected option with aria-selected=true", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, value: "done" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options.at(2).attributes("aria-selected")).toBe("true")
    expect(options.at(0).attributes("aria-selected")).toBe("false")
  })

  it("renders check icon only on the selected option", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, value: "in-progress" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options.at(0).find(".vpick-option-check svg").exists()).toBe(false)
    expect(options.at(1).find(".vpick-option-check svg").exists()).toBe(true)
    expect(options.at(2).find(".vpick-option-check svg").exists()).toBe(false)
  })

  it("does not emit for disabled options", async () => {
    const wrapper = mount(VPick, { propsData: { options: withDisabled } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(1).trigger("click")
    expect(wrapper.emitted("input")).toBeFalsy()
  })
})

describe("VPick (Vue 2) — groups", () => {
  it("renders a group label per group", async () => {
    const wrapper = mount(VPick, { propsData: { options: grouped } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const labels = wrapper.findAll(".vpick-group-label")
    expect(labels).toHaveLength(2)
    expect(labels.at(0).text()).toBe("Fruits")
    expect(labels.at(1).text()).toBe("Veggies")
  })

  it("wraps each group in role=group with aria-labelledby", async () => {
    const wrapper = mount(VPick, { propsData: { options: grouped } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const groups = wrapper.findAll('[role="group"]')
    expect(groups).toHaveLength(2)
    const labelId = groups.at(0).attributes("aria-labelledby")
    expect(labelId).toBeTruthy()
    expect(groups.at(0).find(`#${labelId}`).text()).toBe("Fruits")
  })

  it("does not render a group wrapper for ungrouped items", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
    expect(wrapper.find(".vpick-group-label").exists()).toBe(false)
  })

  it("renders all grouped options as selectable", async () => {
    const wrapper = mount(VPick, { propsData: { options: grouped } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(4)
    expect(options.at(0).text()).toContain("Apple")
    expect(options.at(3).text()).toContain("Daikon")
  })

  it("skips items in a disabled group during keyboard nav", async () => {
    const wrapper = mount(VPick, { propsData: { options: disabledGroup } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "End" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("One")
  })

  it("marks disabled group items with aria-disabled", async () => {
    const wrapper = mount(VPick, { propsData: { options: disabledGroup } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options.at(0).attributes("aria-disabled")).toBeUndefined()
    expect(options.at(1).attributes("aria-disabled")).toBe("true")
    expect(options.at(2).attributes("aria-disabled")).toBe("true")
  })
})

describe("VPick (Vue 2) — separators", () => {
  it("does not render separators by default", async () => {
    const wrapper = mount(VPick, { propsData: { options: grouped } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(0)
  })

  it("renders separators between sections when prop is true", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: grouped, separators: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const seps = wrapper.findAll('[role="separator"]')
    expect(seps).toHaveLength(1)
    expect(seps.at(0).attributes("aria-hidden")).toBe("true")
  })

  it("renders no separators for a single section even when prop is true", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, separators: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(0)
  })
})

describe("VPick (Vue 2) — disabled / loading / error", () => {
  it("disables the trigger when disabled prop is set", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, disabled: true },
    })
    expect(
      wrapper.find('[role="combobox"]').attributes("disabled"),
    ).toBeDefined()
  })

  it("does not open when disabled", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, disabled: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
  })

  it("sets aria-busy when loading", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, loading: true },
    })
    expect(wrapper.find('[role="combobox"]').attributes("aria-busy")).toBe(
      "true",
    )
  })

  it("does not open when loading", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, loading: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
  })

  it("sets aria-invalid and error class when error is set", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, error: "Required" },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("aria-invalid")).toBe("true")
    expect(trigger.classes()).toContain("vpick-trigger--error")
  })
})

describe("VPick (Vue 2) — form integration", () => {
  it("does not render hidden select when not inside a form", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, name: "status", required: true },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
    expect(wrapper.find("select.vpick-hidden-select").exists()).toBe(false)
    wrapper.destroy()
  })

  it("renders hidden select when inside a form", async () => {
    const form = document.createElement("form")
    const target = document.createElement("div")
    form.appendChild(target)
    document.body.appendChild(form)
    const wrapper = mount(VPick, {
      propsData: { options: status, name: "status", required: true },
      attachTo: target,
    })
    await nextTick()
    await nextTick()
    const select = wrapper.find("select.vpick-hidden-select")
    expect(select.exists()).toBe(true)
    expect(select.attributes("name")).toBe("status")
    expect(select.attributes("required")).toBeDefined()
    wrapper.destroy()
    form.remove()
  })

  it("reflects value on the hidden select", async () => {
    const form = document.createElement("form")
    const target = document.createElement("div")
    form.appendChild(target)
    document.body.appendChild(form)
    const wrapper = mount(VPick, {
      propsData: { options: status, value: "done" },
      attachTo: target,
    })
    await nextTick()
    await nextTick()
    const select = wrapper.find<HTMLSelectElement>("select.vpick-hidden-select")
    expect(select.element.value).toBe("done")
    wrapper.destroy()
    form.remove()
  })

  it("dispatches a bubbling change event when value updates", async () => {
    const form = document.createElement("form")
    const target = document.createElement("div")
    form.appendChild(target)
    document.body.appendChild(form)
    let bubbled: string | null = null
    form.addEventListener("change", (e) => {
      bubbled = (e.target as HTMLSelectElement).value
    })
    const wrapper = mount(VPick, {
      propsData: { options: status, value: "todo" },
      attachTo: target,
    })
    await nextTick()
    await nextTick()
    await wrapper.setProps({ value: "in-progress" })
    await nextTick()
    await nextTick()
    expect(bubbled).toBe("in-progress")
    wrapper.destroy()
    form.remove()
  })
})

describe("VPick (Vue 2) — ARIA", () => {
  it("trigger exposes combobox semantics", () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("role")).toBe("combobox")
    expect(trigger.attributes("aria-haspopup")).toBe("listbox")
  })

  it("aria-controls points at the listbox id", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, id: "pick-42" },
    })
    expect(wrapper.find('[role="combobox"]').attributes("aria-controls")).toBe(
      "pick-42-listbox",
    )
  })

  it("aria-activedescendant points at highlighted option when open", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, id: "pick" },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    const highlightedId = wrapper
      .find(".vpick-option--highlighted")
      .attributes("id")
    expect(trigger.attributes("aria-activedescendant")).toBe(highlightedId)
  })

  it("aria-activedescendant is absent when closed", () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    expect(
      wrapper.find('[role="combobox"]').attributes("aria-activedescendant"),
    ).toBeUndefined()
  })

  it("forwards aria-label and aria-describedby", () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: status,
        ariaLabel: "Status picker",
        ariaDescribedby: "status-help",
      },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("aria-label")).toBe("Status picker")
    expect(trigger.attributes("aria-describedby")).toBe("status-help")
  })
})

describe("VPick (Vue 2) — instance id reactivity", () => {
  it("trigger id follows a changing id prop", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, id: "actor" },
    })
    expect(wrapper.find('[role="combobox"]').attributes("id")).toBe("actor")
    await wrapper.setProps({ id: "provider" })
    expect(wrapper.find('[role="combobox"]').attributes("id")).toBe("provider")
  })

  it("derived listbox id follows a changing id prop", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, id: "actor" },
    })
    await wrapper.setProps({ id: "provider" })
    expect(wrapper.find('[role="combobox"]').attributes("aria-controls")).toBe(
      "provider-listbox",
    )
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="listbox"]').attributes("id")).toBe(
      "provider-listbox",
    )
  })

  it("option ids follow a changing id prop", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, id: "actor" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="option"]').attributes("id")).toBe("actor-opt-0")
    await wrapper.setProps({ id: "provider" })
    expect(wrapper.find('[role="option"]').attributes("id")).toBe(
      "provider-opt-0",
    )
  })

  it("generated id stays stable across unrelated prop changes", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const generated = wrapper.find('[role="combobox"]').attributes("id")
    expect(generated).toBeTruthy()
    await wrapper.setProps({ placeholder: "Pick one" })
    expect(wrapper.find('[role="combobox"]').attributes("id")).toBe(generated)
  })

  it("falls back to the generated id when the id prop is removed", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, id: "actor" },
    })
    await wrapper.setProps({ id: undefined })
    const fallback = wrapper.find('[role="combobox"]').attributes("id")
    expect(fallback).toBeTruthy()
    expect(fallback).not.toBe("actor")
  })
})

describe("VPick (Vue 2) — slots", () => {
  it("renders a custom icon via the icon slot", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status },
      slots: { icon: '<span class="custom-icon">v</span>' },
    })
    expect(wrapper.find(".custom-icon").exists()).toBe(true)
  })

  it("renders a custom loading icon via the loading slot", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, loading: true },
      slots: { loading: '<span class="custom-spin">o</span>' },
    })
    expect(wrapper.find(".custom-spin").exists()).toBe(true)
  })

  describe("custom keys", () => {
    const users = [
      { id: 1, name: "Alice", inactive: false },
      { id: 2, name: "Bob", inactive: true },
    ]

    it("renders labels via labelKey and emits values via valueKey", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: users,
          labelKey: "name",
          valueKey: "id",
        },
      })
      await wrapper.find(".vpick-trigger").trigger("click")
      const optionEls = wrapper.findAll(".vpick-option-label")
      expect(optionEls.at(0).text()).toBe("Alice")
      expect(optionEls.at(1).text()).toBe("Bob")

      await optionEls.at(0).trigger("click")
      expect(wrapper.emitted("input")![0]).toEqual([1])
    })

    it("shows selected label when value matches a valueKey", () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: users,
          labelKey: "name",
          valueKey: "id",
          value: 2,
        },
      })
      expect(wrapper.find(".vpick-trigger-label").text()).toBe("Bob")
    })

    it("applies disabledKey to individual options", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: users,
          labelKey: "name",
          valueKey: "id",
          disabledKey: "inactive",
        },
      })
      await wrapper.find(".vpick-trigger").trigger("click")
      const bob = wrapper.findAll(".vpick-option").at(1)
      expect(bob.classes()).toContain("vpick-option--disabled")
      expect(bob.attributes("aria-disabled")).toBe("true")
    })

    it("detects groups via groupOptionsKey", async () => {
      const regions = [
        {
          name: "Americas",
          members: [
            { id: "us", name: "United States" },
            { id: "ca", name: "Canada" },
          ],
        },
      ]
      const wrapper = mount(VPick, {
        propsData: {
          options: regions,
          labelKey: "name",
          valueKey: "id",
          groupOptionsKey: "members",
        },
      })
      await wrapper.find(".vpick-trigger").trigger("click")
      expect(wrapper.find(".vpick-group-label").text()).toBe("Americas")
      const opts = wrapper.findAll(".vpick-option-label")
      expect(opts.at(0).text()).toBe("United States")
      expect(opts.at(1).text()).toBe("Canada")
    })
  })

  describe("searchable", () => {
    const fruits: OptionOrGroup[] = [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Cherry", value: "cherry" },
      { label: "apricot", value: "apricot" },
    ]

    it("renders an input trigger when searchable is true", () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      expect(wrapper.find("button.vpick-trigger").exists()).toBe(false)
      const input = wrapper.find("input.vpick-trigger-input")
      expect(input.exists()).toBe(true)
      expect(input.attributes("role")).toBe("combobox")
      expect(input.attributes("aria-expanded")).toBe("false")
      expect(input.attributes("aria-haspopup")).toBe("listbox")
      expect(input.attributes("aria-autocomplete")).toBe("list")
    })

    it("filters options as the user types (case-insensitive)", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("AP")
      const labels = wrapper.findAll(".vpick-option-label")
      expect(labels.length).toBe(2)
      expect(labels.at(0).text()).toBe("Apple")
      expect(labels.at(1).text()).toBe("apricot")
    })

    it("opens the dropdown on typing", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      expect(input.attributes("aria-expanded")).toBe("false")
      await input.setValue("a")
      expect(input.attributes("aria-expanded")).toBe("true")
    })

    it("emits search event on every keystroke", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("a")
      await input.setValue("ap")
      const events = wrapper.emitted("search")
      expect(events).toBeDefined()
      expect(events![0]).toEqual(["a"])
      expect(events![1]).toEqual(["ap"])
    })

    it("renders empty state when no matches", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("zzz")
      expect(wrapper.find(".vpick-empty").exists()).toBe(true)
      expect(wrapper.find(".vpick-empty").text()).toBe("No results")
    })

    it("uses noResultsText prop for empty state", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: fruits,
          searchable: true,
          noResultsText: "Nothing found",
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("zzz")
      expect(wrapper.find(".vpick-empty").text()).toBe("Nothing found")
    })

    it("hides empty state while loading to prevent flash", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: [],
          searchable: true,
          loading: true,
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("zzz")
      expect(wrapper.find(".vpick-empty").exists()).toBe(false)
    })

    it("shows spinner instead of chevron while loading in searchable mode", () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true, loading: true },
      })
      const icons = wrapper.findAll(
        ".vpick-trigger--search .vpick-trigger-icon",
      )
      let hasSpinner = false
      let hasChevron = false
      for (let i = 0; i < icons.length; i++) {
        const el = icons.at(i).element as HTMLElement
        if (el.classList.contains("vpick-trigger-spinner")) hasSpinner = true
        if (el.classList.contains("vpick-trigger-icon--button"))
          hasChevron = true
      }
      expect(hasSpinner).toBe(true)
      expect(hasChevron).toBe(false)
    })

    it("disables input while loading in searchable mode", () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true, loading: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
        .element as HTMLInputElement
      expect(input.disabled).toBe(true)
    })

    it("hides empty groups when all children filter out", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          searchable: true,
          options: [
            {
              label: "Fruits",
              options: [
                { label: "Apple", value: "apple" },
                { label: "Banana", value: "banana" },
              ],
            },
            {
              label: "Veggies",
              options: [
                { label: "Carrot", value: "carrot" },
                { label: "Daikon", value: "daikon" },
              ],
            },
          ],
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("apple")
      const labels = wrapper.findAll(".vpick-group-label")
      expect(labels.length).toBe(1)
      expect(labels.at(0).text()).toBe("Fruits")
    })

    it("uses filter prop when provided", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: fruits,
          searchable: true,
          filter: (opt: { value: unknown }, q: string) =>
            String(opt.value).toLowerCase().includes(q.toLowerCase()),
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("cher")
      const labels = wrapper.findAll(".vpick-option-label")
      expect(labels.length).toBe(1)
      expect(labels.at(0).text()).toBe("Cherry")
    })

    it("selects from filtered list with Enter", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("cher")
      await input.trigger("keydown", { key: "Enter" })
      expect(wrapper.emitted("input")![0]).toEqual(["cherry"])
    })

    it("does not select on Space in searchable mode", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("a")
      await input.trigger("keydown", { key: " " })
      expect(wrapper.emitted("input")).toBeUndefined()
    })

    it("retains the filtered list during close animation", async () => {
      // The reset of searchQuery + isUserSearching is deferred to onAfterLeave
      // so the dropdown doesn't flicker from "no results" back to "full list"
      // while fading out. The input text stays frozen through the animation.
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("nomatch")
      expect(wrapper.findAll(".vpick-option").length).toBe(0)
      await input.trigger("keydown", { key: "Escape" })
      expect(wrapper.findAll(".vpick-option").length).toBe(0)
      expect((input.element as HTMLInputElement).value).toBe("nomatch")
    })

    it("closes on Enter when there is no matching result", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("nomatch")
      expect(input.attributes("aria-expanded")).toBe("true")
      await input.trigger("keydown", { key: "Enter" })
      expect(input.attributes("aria-expanded")).toBe("false")
    })

    it("shows selected label in the input when closed", () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: fruits,
          searchable: true,
          value: "banana",
        },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      expect((input.element as HTMLInputElement).value).toBe("Banana")
    })

    it("filters work with non-default labelKey", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          searchable: true,
          options: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
            { id: 3, name: "Charlie" },
          ],
          labelKey: "name",
          valueKey: "id",
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("li")
      const labels = wrapper.findAll(".vpick-option-label")
      expect(labels.length).toBe(2)
      expect(labels.at(0).text()).toBe("Alice")
      expect(labels.at(1).text()).toBe("Charlie")
    })

    it("toggles open/close when the chevron is clicked", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const chevron = wrapper.find(".vpick-trigger-icon--button")
      expect(chevron.exists()).toBe(true)
      const input = wrapper.find("input.vpick-trigger-input")
      await chevron.trigger("click")
      expect(input.attributes("aria-expanded")).toBe("true")
      await chevron.trigger("click")
      expect(input.attributes("aria-expanded")).toBe("false")
    })

    it("chevron is a real <button> with native disabled gating", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true, disabled: true },
      })
      const chevron = wrapper.find(".vpick-trigger-icon--button")
      expect((chevron.element as HTMLElement).tagName).toBe("BUTTON")
      expect((chevron.element as HTMLButtonElement).type).toBe("button")
      expect(chevron.attributes("disabled")).toBeDefined()
      const input = wrapper.find("input.vpick-trigger-input")
      await chevron.trigger("click")
      expect(input.attributes("aria-expanded")).toBe("false")
    })

    it("chevron has no disabled attribute when enabled", () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, searchable: true },
      })
      const chevron = wrapper.find(".vpick-trigger-icon--button")
      expect(chevron.attributes("disabled")).toBeUndefined()
    })
  })

  describe("clearable", () => {
    const fruits: OptionOrGroup[] = [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
    ]

    it("does not render the clear button by default", () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, value: "apple" },
      })
      expect(wrapper.find(".vpick-clear").exists()).toBe(false)
    })

    it("does not render the clear button when there is no selection", () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, clearable: true },
      })
      expect(wrapper.find(".vpick-clear").exists()).toBe(false)
    })

    it("renders the clear button when clearable and selection exists", () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, clearable: true, value: "apple" },
      })
      const clear = wrapper.find(".vpick-clear")
      expect(clear.exists()).toBe(true)
      expect(clear.attributes("aria-label")).toBe("Clear selection")
    })

    it("does not render the clear button when disabled", () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: fruits,
          clearable: true,
          value: "apple",
          disabled: true,
        },
      })
      expect(wrapper.find(".vpick-clear").exists()).toBe(false)
    })

    it("emits undefined on click (button mode)", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, clearable: true, value: "apple" },
      })
      await wrapper.find(".vpick-clear").trigger("click")
      expect(wrapper.emitted("input")![0]).toEqual([undefined])
    })

    it("does not toggle the popup when clear is clicked", async () => {
      const wrapper = mount(VPick, {
        propsData: { options: fruits, clearable: true, value: "apple" },
        attachTo: document.body,
      })
      const trigger = wrapper.find(".vpick-trigger")
      expect(trigger.attributes("aria-expanded")).toBe("false")
      await wrapper.find(".vpick-clear").trigger("click")
      expect(trigger.attributes("aria-expanded")).toBe("false")
    })

    it("renders clear in searchable mode", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: fruits,
          clearable: true,
          searchable: true,
          value: "apple",
        },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("ban")
      expect(wrapper.find(".vpick-clear").exists()).toBe(true)
      await wrapper.find(".vpick-clear").trigger("click")
      expect(wrapper.emitted("input")![0]).toEqual([undefined])
    })
  })
})

describe("VPick (Vue 2) — multiple selection", () => {
  it("renders aria-multiselectable on listbox when multiple", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: [] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(
      wrapper.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBe("true")
  })

  it("shows placeholder when value is empty array", () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: status,
        multiple: true,
        value: [],
        placeholder: "Pick items",
      },
    })
    // multiple always uses searchable trigger — placeholder is on the input
    expect(
      wrapper.find("input.vpick-trigger-input").attributes("placeholder"),
    ).toBe("Pick items")
  })

  it("shows chips (not comma-joined text) when multiple", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: ["todo", "done"] },
    })
    const chips = wrapper.findAll(".vpick-chip")
    expect(chips).toHaveLength(2)
    expect(chips.at(0).find(".vpick-chip-label").text()).toBe("Todo")
    expect(chips.at(1).find(".vpick-chip-label").text()).toBe("Done")
  })

  it("emits array with value added on click", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: ["todo"] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(1).trigger("click")
    expect(wrapper.emitted("input")![0]).toEqual([["todo", "in-progress"]])
  })

  it("emits array with value removed on click (toggle)", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: status,
        multiple: true,
        value: ["todo", "in-progress"],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    expect(wrapper.emitted("input")![0]).toEqual([["in-progress"]])
  })

  it("keeps dropdown open after selection", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: [] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    expect(wrapper.find('[role="listbox"]').isVisible()).toBe(true)
  })

  it("shows checked checkbox on all selected options", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: ["todo", "done"] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options.at(0).find(".vpick-option-checkbox--checked").exists()).toBe(
      true,
    )
    expect(options.at(1).find(".vpick-option-checkbox--checked").exists()).toBe(
      false,
    )
    expect(options.at(2).find(".vpick-option-checkbox--checked").exists()).toBe(
      true,
    )
  })

  it("renders checkbox on every option in multi mode (even unchecked)", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: [] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options.length).toBeGreaterThan(0)
    for (let i = 0; i < options.length; i++) {
      expect(options.at(i).find(".vpick-option-checkbox").exists()).toBe(true)
      expect(options.at(i).find(".vpick-option-check").exists()).toBe(false)
    }
  })

  it("sets aria-selected on all selected options", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: ["todo", "done"] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options.at(0).attributes("aria-selected")).toBe("true")
    expect(options.at(1).attributes("aria-selected")).toBe("false")
    expect(options.at(2).attributes("aria-selected")).toBe("true")
  })

  it("Enter toggles selection in multi mode", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: [] },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "Enter" })
    expect(wrapper.emitted("input")![0]).toEqual([["todo"]])
  })

  it("clear emits empty array", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: status,
        multiple: true,
        value: ["todo"],
        clearable: true,
      },
    })
    await wrapper.find(".vpick-clear").trigger("click")
    expect(wrapper.emitted("input")![0]).toEqual([[]])
  })

  describe("searchable + multiple", () => {
    it("renders chips in searchable trigger", () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: ["todo", "done"],
        },
      })
      const chips = wrapper.findAll(".vpick-chip")
      expect(chips).toHaveLength(2)
      expect(chips.at(0).find(".vpick-chip-label").text()).toBe("Todo")
      expect(chips.at(1).find(".vpick-chip-label").text()).toBe("Done")
    })

    it("chip remove button emits array without that value", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: ["todo", "in-progress"],
        },
      })
      const removes = wrapper.findAll(".vpick-chip-remove")
      await removes.at(0).trigger("click")
      expect(wrapper.emitted("input")![0]).toEqual([["in-progress"]])
    })

    it("chip remove is a native <button> element", () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: ["todo"],
        },
      })
      const remove = wrapper.find(".vpick-chip-remove")
      expect(remove.element.tagName).toBe("BUTTON")
      expect(remove.attributes("type")).toBe("button")
    })

    it("chip remove is disabled when trigger is disabled", () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: ["todo"],
          disabled: true,
        },
      })
      const remove = wrapper.find(".vpick-chip-remove")
      expect((remove.element as HTMLButtonElement).disabled).toBe(true)
    })

    it("chip remove is disabled when trigger is loading", () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: ["todo"],
          loading: true,
        },
      })
      const remove = wrapper.find(".vpick-chip-remove")
      expect((remove.element as HTMLButtonElement).disabled).toBe(true)
    })

    it("Backspace on empty input removes last chip", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: ["todo", "in-progress"],
        },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.trigger("keydown", { key: "Backspace" })
      expect(wrapper.emitted("input")![0]).toEqual([["todo"]])
    })

    it("clears search after selecting in multi+searchable", async () => {
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: [],
        },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("tod")
      await input.trigger("keydown", { key: "Enter" })
      expect(wrapper.emitted("search")).toBeDefined()
      const searchEvents = wrapper.emitted("search")!
      expect(searchEvents[searchEvents.length - 1]).toEqual([""])
    })

    it("shows placeholder only when no chips", () => {
      const empty = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: [],
          placeholder: "Select...",
        },
      })
      const input = empty.find<HTMLInputElement>("input.vpick-trigger-input")
      expect(input.attributes("placeholder")).toBe("Select...")

      const filled = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          searchable: true,
          value: ["todo"],
          placeholder: "Select...",
        },
      })
      const input2 = filled.find<HTMLInputElement>("input.vpick-trigger-input")
      expect(input2.attributes("placeholder")).toBeUndefined()
    })
  })

  describe("form integration", () => {
    it("hidden select has multiple attribute", async () => {
      const form = document.createElement("form")
      const target = document.createElement("div")
      form.appendChild(target)
      document.body.appendChild(form)
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          value: [],
          name: "tags",
        },
        attachTo: target,
      })
      await nextTick()
      await nextTick()
      const select = wrapper.find<HTMLSelectElement>(
        "select.vpick-hidden-select",
      )
      expect(select.element.multiple).toBe(true)
      wrapper.destroy()
      form.remove()
    })

    it("hidden select has selected options for each value", async () => {
      const form = document.createElement("form")
      const target = document.createElement("div")
      form.appendChild(target)
      document.body.appendChild(form)
      const wrapper = mount(VPick, {
        propsData: {
          options: status,
          multiple: true,
          value: ["todo", "done"],
          name: "tags",
        },
        attachTo: target,
      })
      await nextTick()
      await nextTick()
      const options = wrapper.findAll(
        "select.vpick-hidden-select option",
      ).wrappers
      // Vue 2 binds :selected as the DOM property; collect via the option API.
      const selectedValues = options
        .map((o) => o.element as HTMLOptionElement)
        .filter((el) => el.selected)
        .map((el) => el.value)
      expect(selectedValues).toEqual(["todo", "done"])
      wrapper.destroy()
      form.remove()
    })
  })
})

describe("VPick (Vue 2) — empty branches and new select options", () => {
  const withEmpty: OptionOrGroup[] = [
    {
      label: "Branch",
      value: "branch",
      children: [{ label: "Child", value: "child" }],
    },
    { label: "Empty", value: "empty", children: [] },
  ]

  it("empty children array stays a branch and keeps its chevron", async () => {
    const wrapper = mount(VPick, { propsData: { options: withEmpty } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const emptyRow = wrapper
      .findAll('[role="option"]')
      .filter((o) => o.text().includes("Empty"))
      .at(0)
    expect(emptyRow.find(".vpick-option-expand").exists()).toBe(true)
  })

  it("expanding an empty branch shows noChildrenText in an inert row", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: withEmpty, noChildrenText: "Nothing here" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const emptyRow = wrapper
      .findAll('[role="option"]')
      .filter((o) => o.text().includes("Empty"))
      .at(0)
    await emptyRow.find(".vpick-option-expand").trigger("click")
    await nextTick()

    const placeholder = wrapper.find(".vpick-option-empty")
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.text()).toBe("Nothing here")
    expect(placeholder.attributes("role")).toBeUndefined()
  })

  it("arrow keys skip the empty-branch placeholder row", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: withEmpty, defaultExpandLevel: 1 },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await nextTick()

    for (let i = 0; i < 6; i++) {
      await trigger.trigger("keydown", { key: "ArrowDown" })
    }
    await nextTick()

    const highlighted = wrapper.find(".vpick-option--highlighted")
    expect(highlighted.exists()).toBe(true)
    expect(highlighted.text()).toContain("Empty")
    expect(wrapper.find(".vpick-option-empty").classes()).not.toContain(
      "vpick-option--highlighted",
    )
  })

  it("tags branch and leaf rows for CSS, with depth", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: withEmpty, defaultExpandLevel: 1 },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const rows = wrapper.findAll('[role="option"]')
    const branch = rows.filter((o) => o.text().includes("Branch")).at(0)
    const leaf = rows.filter((o) => o.text().includes("Child")).at(0)

    expect(branch.classes()).toContain("vpick-option--branch")
    expect(branch.attributes("data-depth")).toBe("0")
    expect(leaf.classes()).toContain("vpick-option--leaf")
    expect(leaf.attributes("data-depth")).toBe("1")
  })

  it("no-children slot overrides the placeholder text", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: withEmpty, defaultExpandLevel: 1 },
      scopedSlots: {
        "no-children": '<span class="custom-empty">nothing in here</span>',
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const placeholder = wrapper.find(".vpick-option-empty")
    expect(placeholder.find(".custom-empty").exists()).toBe(true)
    expect(placeholder.text()).toBe("nothing in here")
  })

  it("clicking an unselectable branch row toggles expansion", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: withEmpty, disableBranchNodes: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const row = () =>
      wrapper
        .findAll('[role="option"]')
        .filter((o) => o.text().includes("Branch"))
        .at(0)
    expect(row().attributes("aria-expanded")).toBe("false")

    await row().trigger("click")
    await nextTick()
    expect(row().attributes("aria-expanded")).toBe("true")
    expect(wrapper.emitted("input")).toBeFalsy()
  })

  it("disableBranchNodes blocks selecting an empty branch", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: withEmpty, disableBranchNodes: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const emptyRow = wrapper
      .findAll('[role="option"]')
      .filter((o) => o.text().includes("Empty"))
      .at(0)
    await emptyRow.trigger("click")
    expect(wrapper.emitted("input")).toBeFalsy()
  })

  it("select hands back the caller's original object", async () => {
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]
    const wrapper = mount(VPick, {
      propsData: { options: users, labelKey: "name", valueKey: "id" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    expect(wrapper.emitted("select")![0][0]).toBe(users[0])
  })

  it("clearOnSelect false keeps the query after picking", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: status,
        multiple: true,
        value: [],
        clearOnSelect: false,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const input = wrapper.find<HTMLInputElement>("input")
    input.element.value = "do"
    await input.trigger("input")
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    expect(input.element.value).toBe("do")
  })

  it("closeOnSelect true closes after picking in multi mode", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: status,
        multiple: true,
        value: [],
        closeOnSelect: true,
      },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })
})

describe("VPick (Vue 2) — sortValueBy and value-label slot", () => {
  const smallTree: OptionOrGroup[] = [
    {
      label: "Electronics",
      value: "electronics",
      children: [
        { label: "Phones", value: "phones" },
        { label: "Laptops", value: "laptops" },
      ],
    },
    { label: "Books", value: "books" },
  ]

  it("INDEX orders the emitted value by tree position", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: smallTree,
        multiple: true,
        cascade: false,
        defaultExpandLevel: 2,
        sortValueBy: "INDEX",
        value: ["books"],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const rows = wrapper.findAll('[role="option"]')
    await rows
      .filter((o) => o.text().includes("Phones"))
      .at(0)
      .trigger("click")
    const e = wrapper.emitted("input")!
    expect(e[e.length - 1][0]).toEqual(["phones", "books"])
  })

  it("LEVEL puts shallower values first", () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: smallTree,
        multiple: true,
        cascade: false,
        sortValueBy: "LEVEL",
        value: ["phones", "books"],
      },
    })
    const chips = wrapper
      .findAll(".vpick-chip-label")
      .wrappers.map((c) => c.text())
    expect(chips).toEqual(["Books", "Phones"])
  })

  it("value-label slot overrides the trigger label", () => {
    const users = [{ id: 1, name: "Alice", nickname: "Al" }]
    const wrapper = mount(VPick, {
      propsData: {
        options: users,
        labelKey: "name",
        valueKey: "id",
        value: 1,
      },
      scopedSlots: {
        "value-label": '<b class="nick">{{ props.option.raw.nickname }}</b>',
      },
    })
    expect(wrapper.find(".nick").text()).toBe("Al")
  })
})

// Mirrors the Vue 3 contract tests. Element identity is part of the a11y API,
// and parity between adapters is non-negotiable, so it gets pinned in both.
describe("VPick (Vue 2) — accessibility element contract", () => {
  it("non-searchable trigger is a real button with combobox semantics", () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.element.tagName).toBe("BUTTON")
    expect(trigger.attributes("type")).toBe("button")
    expect(trigger.attributes("aria-haspopup")).toBe("listbox")
  })

  it("searchable trigger puts combobox semantics on the input itself", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, searchable: true },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.element.tagName).toBe("INPUT")
    expect(trigger.attributes("type")).toBe("text")
    expect(trigger.attributes("aria-autocomplete")).toBe("list")
  })

  it("listbox carries multiselectable only when multi", async () => {
    const single = mount(VPick, { propsData: { options: status } })
    await single.find('[role="combobox"]').trigger("click")
    expect(
      single.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBeUndefined()

    const multi = mount(VPick, {
      propsData: { options: status, multiple: true, value: [] },
    })
    await multi.find('[role="combobox"]').trigger("click")
    expect(
      multi.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBe("true")
  })

  it("options carry role and selected state", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, value: "todo" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const opts = wrapper.findAll('[role="option"]')
    expect(opts.length).toBe(3)
    expect(opts.at(0).attributes("aria-selected")).toBe("true")
    expect(opts.at(1).attributes("aria-selected")).toBe("false")
  })

  it("hidden form control is a real select, multiple only when multi", () => {
    const single = mount(VPick, { propsData: { options: status } })
    expect(single.find("select").exists()).toBe(true)
    expect(single.find("select").attributes("multiple")).toBeUndefined()

    const multi = mount(VPick, {
      propsData: { options: status, multiple: true, value: [] },
    })
    expect(multi.find("select").attributes("multiple")).toBeDefined()
  })

  it("chip remove is a real button with an accessible name", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, multiple: true, value: ["todo"] },
    })
    const remove = wrapper.find(".vpick-chip-remove")
    expect(remove.element.tagName).toBe("BUTTON")
    expect(remove.attributes("aria-label")).toBe("Remove Todo")
  })

  it("searchable clear is a real button", () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: status,
        searchable: true,
        clearable: true,
        value: "todo",
      },
    })
    const clear = wrapper.find(".vpick-clear")
    expect(clear.element.tagName).toBe("BUTTON")
    expect(clear.attributes("type")).toBe("button")
  })

  // Deliberate exception: nested inside the <button> trigger, where a real
  // button would be invalid HTML.
  it("non-searchable clear stays a span, since it nests inside the trigger button", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, clearable: true, value: "todo" },
    })
    const clear = wrapper.find(".vpick-clear")
    expect(clear.element.tagName).toBe("SPAN")
    expect(clear.attributes("role")).toBe("button")
    expect(clear.element.closest("button")).not.toBe(null)
  })

  it("tree expand control is a button that never takes tab focus", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: [
          {
            label: "Branch",
            value: "branch",
            children: [{ label: "Child", value: "child" }],
          },
        ],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const expand = wrapper.find(".vpick-option-expand")
    expect(expand.element.tagName).toBe("BUTTON")
    expect(expand.attributes("tabindex")).toBe("-1")
  })
})

describe("VPick (Vue 2) — valueFormat", () => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]

  function mountUsers(props = {}) {
    return mount(VPick, {
      propsData: { options: users, labelKey: "name", valueKey: "id", ...props },
    })
  }

  it("emits plain values by default", async () => {
    const wrapper = mountUsers()
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    expect(wrapper.emitted("input")![0][0]).toBe(1)
  })

  it("emits the caller's original object in single mode", async () => {
    const wrapper = mountUsers({ valueFormat: "object" })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    expect(wrapper.emitted("input")![0][0]).toBe(users[0])
  })

  it("understands objects coming back in, matched by value key", () => {
    const wrapper = mountUsers({
      valueFormat: "object",
      value: { id: 2, name: "Bob" },
    })
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("Bob")
  })

  it("emits an array of objects in multi mode", async () => {
    const wrapper = mountUsers({
      valueFormat: "object",
      multiple: true,
      value: [],
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]').at(1).trigger("click")
    expect(wrapper.emitted("input")![0][0]).toEqual([users[1]])
  })

  it("keeps the hidden select working on plain values", () => {
    const wrapper = mountUsers({ valueFormat: "object", value: users[1] })
    expect(wrapper.find<HTMLSelectElement>("select").element.value).toBe("2")
  })
})

describe("VPick (Vue 2) — flattenSearchResults", () => {
  const smallTree: OptionOrGroup[] = [
    {
      label: "Electronics",
      value: "electronics",
      children: [
        { label: "Phones", value: "phones" },
        { label: "Gaming Laptop", value: "gaming" },
      ],
    },
    { label: "Books", value: "books" },
  ]

  async function openAndType(query: string, flatten = false) {
    const wrapper = mount(VPick, {
      propsData: {
        options: smallTree,
        searchable: true,
        ...(flatten ? { flattenSearchResults: true } : {}),
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const input = wrapper.find<HTMLInputElement>("input")
    input.element.value = query
    await input.trigger("input")
    return wrapper
  }

  it("by default shows matches nested under their ancestors", async () => {
    const wrapper = await openAndType("gaming")
    const labels = wrapper
      .findAll('[role="option"]')
      .wrappers.map((o) => o.text())
    expect(labels).toContain("Electronics")
    expect(labels).toContain("Gaming Laptop")
  })

  it("flattened shows only direct matches, no ancestors", async () => {
    const wrapper = await openAndType("gaming", true)
    const labels = wrapper
      .findAll('[role="option"]')
      .wrappers.map((o) => o.text())
    expect(labels).toEqual(["Gaming Laptop"])
  })

  it("flattened drops the indent", async () => {
    const wrapper = await openAndType("gaming", true)
    expect(wrapper.find('[role="option"]').attributes("data-depth")).toBe("0")
  })

  it("flattened options remain selectable", async () => {
    const wrapper = await openAndType("gaming", true)
    await wrapper.find('[role="option"]').trigger("click")
    expect(wrapper.emitted("input")![0][0]).toBe("gaming")
  })
})

describe("VPick (Vue 2) — alwaysOpen", () => {
  it("starts open and refuses to close", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, alwaysOpen: true },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("aria-expanded")).toBe("true")
    await trigger.trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("true")
    await trigger.trigger("keydown", { key: "Escape" })
    expect(trigger.attributes("aria-expanded")).toBe("true")
  })

  it("renders in flow rather than moving the panel to body", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, alwaysOpen: true },
      attachTo: document.body,
    })
    await nextTick()
    const positioner = wrapper.find(".vpick-positioner").element
    expect(wrapper.element.contains(positioner)).toBe(true)
    expect(positioner.parentElement).not.toBe(document.body)
    wrapper.destroy()
  })

  it("skips fixed positioning", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, alwaysOpen: true },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
    const positioner = wrapper.find(".vpick-positioner").element as HTMLElement
    expect(positioner.style.position).toBe("")
    expect(positioner.style.transform).toBe("")
    wrapper.destroy()
  })

  it("tags the root and hides the chevron", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, alwaysOpen: true },
    })
    expect(wrapper.classes()).toContain("vpick--inline")
    expect(wrapper.find(".vpick-trigger-icon").exists()).toBe(false)
  })

  // The searchable trigger is a separate branch from the button trigger, so it
  // needs its own guard. `multiple` reaches it too, since it forces searchable.
  it.each([
    ["searchable", { searchable: true }],
    ["multiple", { multiple: true }],
  ])("hides the chevron in %s mode too", (_label, extra) => {
    const inline = mount(VPick, {
      propsData: { options: status, alwaysOpen: true, ...extra },
    })
    expect(inline.find(".vpick-trigger-icon").exists()).toBe(false)

    const normal = mount(VPick, { propsData: { options: status, ...extra } })
    expect(normal.find(".vpick-trigger-icon").exists()).toBe(true)
  })

  it("still selects", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, alwaysOpen: true },
    })
    await wrapper.findAll('[role="option"]').at(1).trigger("click")
    expect(wrapper.emitted("input")![0][0]).toBe("in-progress")
  })

  it("re-enabling reopens it", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, alwaysOpen: true, disabled: true },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("aria-expanded")).toBe("false")
    await wrapper.setProps({ disabled: false })
    await nextTick()
    expect(trigger.attributes("aria-expanded")).toBe("true")
  })

  it("closes when disabled", () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, alwaysOpen: true, disabled: true },
    })
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
  })
})

describe("VPick (Vue 2) — disabling an open dropdown", () => {
  it("closes it", async () => {
    const wrapper = mount(VPick, { propsData: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("true")
    await wrapper.setProps({ disabled: true })
    await nextTick()
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("refuses selections while disabled", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: status, alwaysOpen: true },
    })
    await wrapper.setProps({ disabled: true })
    await nextTick()
    const opts = wrapper.findAll('[role="option"]')
    if (opts.length) await opts.at(0).trigger("click")
    expect(wrapper.emitted("input")).toBeFalsy()
  })
})

describe("VPick (Vue 2) — revealing the selection on open", () => {
  const deep: OptionOrGroup[] = [
    {
      label: "Electronics",
      value: "electronics",
      children: [
        {
          label: "Laptops",
          value: "laptops",
          children: [{ label: "Gaming", value: "gaming" }],
        },
      ],
    },
    { label: "Books", value: "books" },
  ]

  it("expands collapsed ancestors to reveal a deep selection", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: deep, value: "gaming" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const labels = wrapper
      .findAll('[role="option"]')
      .wrappers.map((o) => o.text())
    expect(labels).toContain("Gaming")
  })

  it("leaves the tree collapsed when nothing is selected", async () => {
    const wrapper = mount(VPick, { propsData: { options: deep } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const labels = wrapper
      .findAll('[role="option"]')
      .wrappers.map((o) => o.text())
    expect(labels).toEqual(["Electronics", "Books"])
  })
})

describe("VPick (Vue 2) — the 0.16 props", () => {
  const nested: OptionOrGroup[] = [
    {
      label: "Electronics",
      value: "e",
      children: [
        {
          label: "Laptops",
          value: "l",
          children: [{ label: "Gaming", value: "g" }],
        },
      ],
    },
    { label: "Books", value: "b" },
  ]

  it("says so when there are no options at all", async () => {
    const wrapper = mount(VPick, { propsData: { options: [] } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find(".vpick-empty").text()).toBe("No options available")
  })

  it("noOptionsText is configurable", async () => {
    const wrapper = mount(VPick, {
      propsData: { options: [], noOptionsText: "Nothing here yet" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find(".vpick-empty").text()).toBe("Nothing here yet")
  })

  it("Delete removes the last chip, and can be turned off", async () => {
    const on = mount(VPick, {
      propsData: { options: status, multiple: true, value: ["todo", "done"] },
    })
    await on.find("input").trigger("keydown", { key: "Delete" })
    expect(on.emitted("input")![0][0]).toEqual(["todo"])

    const off = mount(VPick, {
      propsData: {
        options: status,
        multiple: true,
        value: ["todo", "done"],
        deleteRemoves: false,
      },
    })
    await off.find("input").trigger("keydown", { key: "Delete" })
    expect(off.emitted("input")).toBeFalsy()
  })

  it("labelKey takes the first non-empty key", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: [
          { id: 1, label: "Alice" },
          { id: 2, name: "Bob" },
        ],
        labelKey: ["label", "name"],
        valueKey: "id",
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(
      wrapper.findAll('[role="option"]').wrappers.map((o) => o.text()),
    ).toEqual(["Alice", "Bob"])
  })

  it("searchNested lets a multi-word query span the ancestor path", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: nested,
        searchable: true,
        searchNested: true,
        flattenSearchResults: true,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const input = wrapper.find<HTMLInputElement>("input")
    input.element.value = "electronics gaming"
    await input.trigger("input")
    await nextTick()
    expect(
      wrapper.findAll('[role="option"]').wrappers.map((o) => o.text()),
    ).toEqual(["Gaming"])
  })
})
