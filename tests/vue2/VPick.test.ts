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
    const listbox = wrapper.find<HTMLElement>('[role="listbox"]')
    expect(listbox.element.style.display).toBe("none")
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
})
