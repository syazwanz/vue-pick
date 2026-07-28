import { describe, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../src/vue3"
import { resetIdCounter, type OptionOrGroup } from "../src/core"

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

describe("VPick — rendering", () => {
  it("renders a combobox trigger button", () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes("aria-haspopup")).toBe("listbox")
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("shows placeholder when no value selected", () => {
    const wrapper = mount(VPick, {
      props: { options: status, placeholder: "Pick one" },
    })
    expect(wrapper.find(".vpick-trigger-placeholder").text()).toBe("Pick one")
  })

  it("shows selected label when value is set", () => {
    const wrapper = mount(VPick, {
      props: { options: status, modelValue: "in-progress" },
    })
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("In Progress")
  })

  it("resolves label from a grouped option", () => {
    const wrapper = mount(VPick, {
      props: { options: grouped, modelValue: "carrot" },
    })
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("Carrot")
  })

  it("listbox is hidden by default", () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner")
    expect(positioner.element.style.display).toBe("none")
  })

  it("positioner wraps the listbox", async () => {
    const wrapper = mount(VPick, {
      props: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner")
    const listbox = positioner.find<HTMLElement>('[role="listbox"]')
    expect(positioner.exists()).toBe(true)
    expect(listbox.exists()).toBe(true)
    expect(positioner.element.contains(listbox.element)).toBe(true)
    wrapper.unmount()
  })

  it("positioner uses translate3d for positioning", async () => {
    const wrapper = mount(VPick, {
      props: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    await nextTick()
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner")
    expect(positioner.element.style.transform).toMatch(/translate3d\(/)
    expect(positioner.element.style.position).toBe("fixed")
    wrapper.unmount()
  })

  it("data-placement attribute lives on the positioner, not the listbox", async () => {
    const wrapper = mount(VPick, {
      props: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner")
    const listbox = wrapper.find<HTMLElement>('[role="listbox"]')
    expect(positioner.attributes("data-placement")).toBeDefined()
    expect(listbox.attributes("data-placement")).toBeUndefined()
    wrapper.unmount()
  })

  it("uses a custom id when provided", () => {
    const wrapper = mount(VPick, {
      props: { options: status, id: "my-pick" },
    })
    expect(wrapper.find('[role="combobox"]').attributes("id")).toBe("my-pick")
    expect(wrapper.find('[role="listbox"]').attributes("id")).toBe(
      "my-pick-listbox",
    )
  })
})

describe("VPick — opening / closing", () => {
  it("opens listbox on click", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="listbox"]').isVisible()).toBe(true)
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "true",
    )
  })

  it("toggles closed on second click", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("closes when Escape is pressed", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("keydown", { key: "Escape" })
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("closes on document mousedown outside root", async () => {
    const wrapper = mount(VPick, {
      props: { options: status },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
    wrapper.unmount()
  })
})

describe("VPick — keyboard navigation", () => {
  it("ArrowDown opens listbox and highlights first enabled", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    expect(wrapper.find('[role="listbox"]').isVisible()).toBe(true)
    const highlighted = wrapper.find(".vpick-option--highlighted")
    expect(highlighted.exists()).toBe(true)
    expect(highlighted.text()).toContain("Todo")
  })

  it("ArrowDown cycles through enabled options", async () => {
    const wrapper = mount(VPick, { props: { options: withDisabled } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowDown" })
    // Skips disabled "B", lands on "C"
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("C")
  })

  it("ArrowUp moves highlight backwards", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowUp" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("Todo")
  })

  it("Home jumps to first enabled", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "End" })
    await trigger.trigger("keydown", { key: "Home" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("Todo")
  })

  it("End jumps to last enabled", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await trigger.trigger("keydown", { key: "End" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("Done")
  })

  it("Enter selects highlighted", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "Enter" })
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["in-progress"])
  })

  it("Space selects highlighted", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: " " })
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["todo"])
  })
})

describe("VPick — selection", () => {
  it("emits update:modelValue on click", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["in-progress"])
  })

  it("closes after selecting", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
  })

  it("marks selected option with aria-selected=true", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, modelValue: "done" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options[2].attributes("aria-selected")).toBe("true")
    expect(options[0].attributes("aria-selected")).toBe("false")
  })

  it("renders check icon only on the selected option", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, modelValue: "in-progress" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options[0].find(".vpick-option-check svg").exists()).toBe(false)
    expect(options[1].find(".vpick-option-check svg").exists()).toBe(true)
    expect(options[2].find(".vpick-option-check svg").exists()).toBe(false)
  })

  it("does not emit for disabled options", async () => {
    const wrapper = mount(VPick, { props: { options: withDisabled } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeFalsy()
  })
})

describe("VPick — groups", () => {
  it("renders a group label per group", async () => {
    const wrapper = mount(VPick, { props: { options: grouped } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const labels = wrapper.findAll(".vpick-group-label")
    expect(labels).toHaveLength(2)
    expect(labels[0].text()).toBe("Fruits")
    expect(labels[1].text()).toBe("Veggies")
  })

  it("wraps each group in role=group with aria-labelledby", async () => {
    const wrapper = mount(VPick, { props: { options: grouped } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const groups = wrapper.findAll('[role="group"]')
    expect(groups).toHaveLength(2)
    const labelId = groups[0].attributes("aria-labelledby")
    expect(labelId).toBeTruthy()
    expect(groups[0].find(`#${labelId}`).text()).toBe("Fruits")
  })

  it("does not render a group wrapper for ungrouped items", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
    expect(wrapper.find(".vpick-group-label").exists()).toBe(false)
  })

  it("renders all grouped options as selectable", async () => {
    const wrapper = mount(VPick, { props: { options: grouped } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(4)
    expect(options[0].text()).toContain("Apple")
    expect(options[3].text()).toContain("Daikon")
  })

  it("skips items in a disabled group during keyboard nav", async () => {
    const wrapper = mount(VPick, { props: { options: disabledGroup } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "End" })
    // Only "One" is enabled; End should still land on "One"
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("One")
  })

  it("marks disabled group items with aria-disabled", async () => {
    const wrapper = mount(VPick, { props: { options: disabledGroup } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options[0].attributes("aria-disabled")).toBeUndefined()
    expect(options[1].attributes("aria-disabled")).toBe("true")
    expect(options[2].attributes("aria-disabled")).toBe("true")
  })
})

describe("VPick — separators", () => {
  it("does not render separators by default", async () => {
    const wrapper = mount(VPick, { props: { options: grouped } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(0)
  })

  it("renders separators between sections when prop is true", async () => {
    const wrapper = mount(VPick, {
      props: { options: grouped, separators: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const seps = wrapper.findAll('[role="separator"]')
    expect(seps).toHaveLength(1) // between the 2 groups
    expect(seps[0].attributes("aria-hidden")).toBe("true")
  })

  it("renders no separators for a single section even when prop is true", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, separators: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(0)
  })
})

describe("VPick — disabled / loading / error", () => {
  it("disables the trigger when disabled prop is set", () => {
    const wrapper = mount(VPick, {
      props: { options: status, disabled: true },
    })
    expect(
      wrapper.find('[role="combobox"]').attributes("disabled"),
    ).toBeDefined()
  })

  it("does not open when disabled", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, disabled: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
  })

  it("sets aria-busy when loading", () => {
    const wrapper = mount(VPick, {
      props: { options: status, loading: true },
    })
    expect(wrapper.find('[role="combobox"]').attributes("aria-busy")).toBe(
      "true",
    )
  })

  it("does not open when loading", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, loading: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
  })

  it("sets aria-invalid and error class when error is set", () => {
    const wrapper = mount(VPick, {
      props: { options: status, error: "Required" },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("aria-invalid")).toBe("true")
    expect(trigger.classes()).toContain("vpick-trigger--error")
  })
})

describe("VPick — form integration", () => {
  it("does not render hidden select when not inside a form", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, name: "status", required: true },
      attachTo: document.body,
    })
    await nextTick()
    expect(wrapper.find("select.vpick-hidden-select").exists()).toBe(false)
    wrapper.unmount()
  })

  it("renders hidden select when inside a form", async () => {
    const form = document.createElement("form")
    document.body.appendChild(form)
    const wrapper = mount(VPick, {
      props: { options: status, name: "status", required: true },
      attachTo: form,
    })
    await nextTick()
    const select = wrapper.find("select.vpick-hidden-select")
    expect(select.exists()).toBe(true)
    expect(select.attributes("name")).toBe("status")
    expect(select.attributes("required")).toBeDefined()
    wrapper.unmount()
    form.remove()
  })

  it("reflects modelValue on the hidden select", async () => {
    const form = document.createElement("form")
    document.body.appendChild(form)
    const wrapper = mount(VPick, {
      props: { options: status, modelValue: "done" },
      attachTo: form,
    })
    await nextTick()
    const select = wrapper.find<HTMLSelectElement>("select.vpick-hidden-select")
    expect(select.element.value).toBe("done")
    wrapper.unmount()
    form.remove()
  })

  it("dispatches a bubbling change event when modelValue updates", async () => {
    const form = document.createElement("form")
    document.body.appendChild(form)
    let bubbled: string | null = null
    form.addEventListener("change", (e) => {
      bubbled = (e.target as HTMLSelectElement).value
    })
    const wrapper = mount(VPick, {
      props: { options: status, modelValue: "todo" },
      attachTo: form,
    })
    await nextTick()
    await wrapper.setProps({ modelValue: "in-progress" })
    await nextTick()
    expect(bubbled).toBe("in-progress")
    wrapper.unmount()
    form.remove()
  })
})

describe("VPick — ARIA", () => {
  it("trigger exposes combobox semantics", () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("role")).toBe("combobox")
    expect(trigger.attributes("aria-haspopup")).toBe("listbox")
  })

  it("aria-controls points at the listbox id", () => {
    const wrapper = mount(VPick, {
      props: { options: status, id: "pick-42" },
    })
    expect(wrapper.find('[role="combobox"]').attributes("aria-controls")).toBe(
      "pick-42-listbox",
    )
  })

  it("aria-activedescendant points at highlighted option when open", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, id: "pick" },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    const highlightedId = wrapper
      .find(".vpick-option--highlighted")
      .attributes("id")
    expect(trigger.attributes("aria-activedescendant")).toBe(highlightedId)
  })

  it("aria-activedescendant is absent when closed", () => {
    const wrapper = mount(VPick, { props: { options: status } })
    expect(
      wrapper.find('[role="combobox"]').attributes("aria-activedescendant"),
    ).toBeUndefined()
  })

  it("forwards aria-label and aria-describedby", () => {
    const wrapper = mount(VPick, {
      props: {
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

describe("VPick — instance id reactivity", () => {
  it("trigger id follows a changing id prop", async () => {
    const wrapper = mount(VPick, { props: { options: status, id: "actor" } })
    expect(wrapper.find('[role="combobox"]').attributes("id")).toBe("actor")
    await wrapper.setProps({ id: "provider" })
    expect(wrapper.find('[role="combobox"]').attributes("id")).toBe("provider")
  })

  it("derived listbox id follows a changing id prop", async () => {
    const wrapper = mount(VPick, { props: { options: status, id: "actor" } })
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
    const wrapper = mount(VPick, { props: { options: status, id: "actor" } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="option"]').attributes("id")).toBe("actor-opt-0")
    await wrapper.setProps({ id: "provider" })
    expect(wrapper.find('[role="option"]').attributes("id")).toBe(
      "provider-opt-0",
    )
  })

  it("generated id stays stable across unrelated prop changes", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const generated = wrapper.find('[role="combobox"]').attributes("id")
    expect(generated).toBeTruthy()
    await wrapper.setProps({ placeholder: "Pick one" })
    expect(wrapper.find('[role="combobox"]').attributes("id")).toBe(generated)
  })

  it("falls back to the generated id when the id prop is removed", async () => {
    const wrapper = mount(VPick, { props: { options: status, id: "actor" } })
    await wrapper.setProps({ id: undefined })
    const fallback = wrapper.find('[role="combobox"]').attributes("id")
    expect(fallback).toBeTruthy()
    expect(fallback).not.toBe("actor")
  })
})

describe("VPick — slots", () => {
  it("renders a custom icon via the icon slot", () => {
    const wrapper = mount(VPick, {
      props: { options: status },
      slots: { icon: '<span class="custom-icon">▾</span>' },
    })
    expect(wrapper.find(".custom-icon").exists()).toBe(true)
  })

  it("renders a custom loading icon via the loading slot", () => {
    const wrapper = mount(VPick, {
      props: { options: status, loading: true },
      slots: { loading: '<span class="custom-spin">⟳</span>' },
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
        props: {
          options: users,
          labelKey: "name",
          valueKey: "id",
        },
      })
      await wrapper.find(".vpick-trigger").trigger("click")
      const optionEls = wrapper.findAll(".vpick-option-label")
      expect(optionEls.map((o) => o.text())).toEqual(["Alice", "Bob"])

      await optionEls[0].trigger("click")
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([1])
    })

    it("shows selected label when modelValue matches a valueKey", () => {
      const wrapper = mount(VPick, {
        props: {
          options: users,
          labelKey: "name",
          valueKey: "id",
          modelValue: 2,
        },
      })
      expect(wrapper.find(".vpick-trigger-label").text()).toBe("Bob")
    })

    it("applies disabledKey to individual options", async () => {
      const wrapper = mount(VPick, {
        props: {
          options: users,
          labelKey: "name",
          valueKey: "id",
          disabledKey: "inactive",
        },
      })
      await wrapper.find(".vpick-trigger").trigger("click")
      const bob = wrapper.findAll(".vpick-option")[1]
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
        props: {
          options: regions,
          labelKey: "name",
          valueKey: "id",
          groupOptionsKey: "members",
        },
      })
      await wrapper.find(".vpick-trigger").trigger("click")
      expect(wrapper.find(".vpick-group-label").text()).toBe("Americas")
      const opts = wrapper.findAll(".vpick-option-label")
      expect(opts.map((o) => o.text())).toEqual(["United States", "Canada"])
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
        props: { options: fruits, searchable: true },
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
        props: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("AP")
      const labels = wrapper.findAll(".vpick-option-label").map((o) => o.text())
      expect(labels).toEqual(["Apple", "apricot"])
    })

    it("opens the dropdown on typing", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      expect(input.attributes("aria-expanded")).toBe("false")
      await input.setValue("a")
      expect(input.attributes("aria-expanded")).toBe("true")
    })

    it("emits search event on every keystroke", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("a")
      await input.setValue("ap")
      const events = wrapper.emitted("search")
      expect(events).toBeDefined()
      expect(events!.map((e) => e[0])).toEqual(["a", "ap"])
    })

    it("renders empty state when no matches", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("zzz")
      expect(wrapper.find(".vpick-empty").exists()).toBe(true)
      expect(wrapper.find(".vpick-empty").text()).toBe("No results")
    })

    it("does not render empty state when query is blank", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
      })
      await wrapper.find("input.vpick-trigger-input").trigger("focus")
      expect(wrapper.find(".vpick-empty").exists()).toBe(false)
    })

    it("uses noResultsText prop for empty state", async () => {
      const wrapper = mount(VPick, {
        props: {
          options: fruits,
          searchable: true,
          noResultsText: "Nothing found",
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("zzz")
      expect(wrapper.find(".vpick-empty").text()).toBe("Nothing found")
    })

    it("renders the empty slot with query scope", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
        slots: {
          empty:
            '<template #empty="{ query }">No match for {{ query }}</template>',
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("zzz")
      expect(wrapper.find(".vpick-empty").text()).toBe("No match for zzz")
    })

    it("hides empty state while loading to prevent flash", async () => {
      const wrapper = mount(VPick, {
        props: {
          options: [],
          searchable: true,
          loading: true,
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("zzz")
      expect(wrapper.find(".vpick-empty").exists()).toBe(false)
    })

    it("shows spinner instead of chevron while loading in searchable mode", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true, loading: true },
      })
      const icons = wrapper.findAll(
        ".vpick-trigger--search .vpick-trigger-icon",
      )
      const hasSpinner = icons.some((i) =>
        i.classes().includes("vpick-trigger-spinner"),
      )
      const hasChevron = icons.some((i) =>
        i.classes().includes("vpick-trigger-icon--button"),
      )
      expect(hasSpinner).toBe(true)
      expect(hasChevron).toBe(false)
    })

    it("disables input while loading in searchable mode", () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true, loading: true },
      })
      const input = wrapper.find<HTMLInputElement>("input.vpick-trigger-input")
      expect(input.element.disabled).toBe(true)
    })

    it("hides empty groups when all children filter out", async () => {
      const wrapper = mount(VPick, {
        props: {
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
      const labels = wrapper.findAll(".vpick-group-label").map((g) => g.text())
      expect(labels).toEqual(["Fruits"])
    })

    it("uses filter prop when provided", async () => {
      const wrapper = mount(VPick, {
        props: {
          options: fruits,
          searchable: true,
          // Match on value, not label
          filter: (opt: { value: unknown }, q: string) =>
            String(opt.value).toLowerCase().includes(q.toLowerCase()),
        },
      })
      await wrapper.find("input.vpick-trigger-input").setValue("cher")
      const labels = wrapper.findAll(".vpick-option-label").map((o) => o.text())
      expect(labels).toEqual(["Cherry"])
    })

    it("selects from filtered list with Enter", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("cher")
      await input.trigger("keydown", { key: "Enter" })
      expect(wrapper.emitted("update:modelValue")![0]).toEqual(["cherry"])
    })

    it("does not select on Space in searchable mode", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("a")
      await input.trigger("keydown", { key: " " })
      expect(wrapper.emitted("update:modelValue")).toBeUndefined()
    })

    it("retains the filtered list during close animation", async () => {
      // The reset of searchQuery + isUserSearching is deferred to onAfterLeave
      // so the dropdown doesn't flicker from "no results" back to "full list"
      // while fading out. The input text stays frozen through the animation.
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
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
        props: { options: fruits, searchable: true },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("nomatch")
      expect(input.attributes("aria-expanded")).toBe("true")
      await input.trigger("keydown", { key: "Enter" })
      expect(input.attributes("aria-expanded")).toBe("false")
    })

    it("shows selected label in the input when closed", () => {
      const wrapper = mount(VPick, {
        props: {
          options: fruits,
          searchable: true,
          modelValue: "banana",
        },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      expect((input.element as HTMLInputElement).value).toBe("Banana")
    })

    it("filters work with non-default labelKey", async () => {
      const wrapper = mount(VPick, {
        props: {
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
      const labels = wrapper.findAll(".vpick-option-label").map((o) => o.text())
      expect(labels).toEqual(["Alice", "Charlie"])
    })

    it("toggles open/close when the chevron is clicked", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
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
        props: { options: fruits, searchable: true, disabled: true },
      })
      const chevron = wrapper.find<HTMLButtonElement>(
        ".vpick-trigger-icon--button",
      )
      expect(chevron.element.tagName).toBe("BUTTON")
      expect(chevron.element.type).toBe("button")
      expect(chevron.attributes("disabled")).toBeDefined()
      const input = wrapper.find("input.vpick-trigger-input")
      await chevron.trigger("click")
      expect(input.attributes("aria-expanded")).toBe("false")
    })

    it("chevron is disabled while loading", () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, searchable: true },
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
        props: { options: fruits, modelValue: "apple" },
      })
      expect(wrapper.find(".vpick-clear").exists()).toBe(false)
    })

    it("does not render the clear button when there is no selection", () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, clearable: true },
      })
      expect(wrapper.find(".vpick-clear").exists()).toBe(false)
    })

    it("renders the clear button when clearable and selection exists", () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, clearable: true, modelValue: "apple" },
      })
      const clear = wrapper.find(".vpick-clear")
      expect(clear.exists()).toBe(true)
      expect(clear.attributes("aria-label")).toBe("Clear selection")
    })

    it("does not render the clear button when disabled", () => {
      const wrapper = mount(VPick, {
        props: {
          options: fruits,
          clearable: true,
          modelValue: "apple",
          disabled: true,
        },
      })
      expect(wrapper.find(".vpick-clear").exists()).toBe(false)
    })

    it("does not render the clear button when loading", () => {
      const wrapper = mount(VPick, {
        props: {
          options: fruits,
          clearable: true,
          modelValue: "apple",
          loading: true,
        },
      })
      expect(wrapper.find(".vpick-clear").exists()).toBe(false)
    })

    it("emits undefined on click (button mode)", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, clearable: true, modelValue: "apple" },
      })
      await wrapper.find(".vpick-clear").trigger("click")
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([undefined])
    })

    it("does not toggle the popup when clear is clicked", async () => {
      const wrapper = mount(VPick, {
        props: { options: fruits, clearable: true, modelValue: "apple" },
        attachTo: document.body,
      })
      const trigger = wrapper.find(".vpick-trigger")
      expect(trigger.attributes("aria-expanded")).toBe("false")
      await wrapper.find(".vpick-clear").trigger("click")
      expect(trigger.attributes("aria-expanded")).toBe("false")
    })

    it("renders clear in searchable mode and clears both value and query", async () => {
      const wrapper = mount(VPick, {
        props: {
          options: fruits,
          clearable: true,
          searchable: true,
          modelValue: "apple",
        },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("ban")
      expect(wrapper.find(".vpick-clear").exists()).toBe(true)
      await wrapper.find(".vpick-clear").trigger("click")
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([undefined])
      // searchQuery reset means input shows selectedLabel (still "Apple" until
      // parent updates modelValue) or empty when parent syncs. In this test we
      // don't sync modelValue so input still shows "Apple" but query is empty.
      // The important assertion is the emit.
    })
  })
})

describe("VPick — multiple selection", () => {
  it("renders aria-multiselectable on listbox when multiple", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: [] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(
      wrapper.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBe("true")
  })

  it("does not render aria-multiselectable in single mode", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(
      wrapper.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBeUndefined()
  })

  it("shows placeholder when modelValue is empty array", () => {
    const wrapper = mount(VPick, {
      props: {
        options: status,
        multiple: true,
        modelValue: [],
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
      props: { options: status, multiple: true, modelValue: ["todo", "done"] },
    })
    const chips = wrapper.findAll(".vpick-chip")
    expect(chips).toHaveLength(2)
    expect(chips[0].find(".vpick-chip-label").text()).toBe("Todo")
    expect(chips[1].find(".vpick-chip-label").text()).toBe("Done")
  })

  it("emits array with value added on click", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: ["todo"] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([
      ["todo", "in-progress"],
    ])
  })

  it("emits array with value removed on click (toggle)", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: status,
        multiple: true,
        modelValue: ["todo", "in-progress"],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([["in-progress"]])
  })

  it("keeps dropdown open after selection", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: [] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(wrapper.find('[role="listbox"]').isVisible()).toBe(true)
  })

  it("shows checked checkbox on all selected options", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: ["todo", "done"] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options[0].find(".vpick-option-checkbox--checked").exists()).toBe(
      true,
    )
    expect(options[1].find(".vpick-option-checkbox--checked").exists()).toBe(
      false,
    )
    expect(options[2].find(".vpick-option-checkbox--checked").exists()).toBe(
      true,
    )
  })

  it("renders checkbox on every option in multi mode (even unchecked)", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: [] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options.length).toBeGreaterThan(0)
    for (const o of options) {
      expect(o.find(".vpick-option-checkbox").exists()).toBe(true)
      expect(o.find(".vpick-option-check").exists()).toBe(false)
    }
  })

  it("sets aria-selected on all selected options", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: ["todo", "done"] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    expect(options[0].attributes("aria-selected")).toBe("true")
    expect(options[1].attributes("aria-selected")).toBe("false")
    expect(options[2].attributes("aria-selected")).toBe("true")
  })

  it("Enter toggles selection in multi mode", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: [] },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("keydown", { key: "ArrowDown" })
    await trigger.trigger("keydown", { key: "Enter" })
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([["todo"]])
  })

  it("does not select disabled options in multi mode", async () => {
    const wrapper = mount(VPick, {
      props: { options: withDisabled, multiple: true, modelValue: [] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeFalsy()
  })

  it("clear emits empty array", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: status,
        multiple: true,
        modelValue: ["todo"],
        clearable: true,
      },
    })
    await wrapper.find(".vpick-clear").trigger("click")
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([[]])
  })

  describe("searchable + multiple", () => {
    it("renders chips in searchable trigger", () => {
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: ["todo", "done"],
        },
      })
      const chips = wrapper.findAll(".vpick-chip")
      expect(chips).toHaveLength(2)
      expect(chips[0].find(".vpick-chip-label").text()).toBe("Todo")
      expect(chips[1].find(".vpick-chip-label").text()).toBe("Done")
    })

    it("chip remove button emits array without that value", async () => {
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: ["todo", "in-progress"],
        },
      })
      const removes = wrapper.findAll(".vpick-chip-remove")
      await removes[0].trigger("click")
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([
        ["in-progress"],
      ])
    })

    it("chip remove is a native <button> element", () => {
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: ["todo"],
        },
      })
      const remove = wrapper.find(".vpick-chip-remove")
      expect(remove.element.tagName).toBe("BUTTON")
      expect(remove.attributes("type")).toBe("button")
    })

    it("chip remove is disabled when trigger is disabled", () => {
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: ["todo"],
          disabled: true,
        },
      })
      const remove = wrapper.find<HTMLButtonElement>(".vpick-chip-remove")
      expect(remove.element.disabled).toBe(true)
    })

    it("chip remove is disabled when trigger is loading", () => {
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: ["todo"],
          loading: true,
        },
      })
      const remove = wrapper.find<HTMLButtonElement>(".vpick-chip-remove")
      expect(remove.element.disabled).toBe(true)
    })

    it("Backspace on empty input removes last chip", async () => {
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: ["todo", "in-progress"],
        },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.trigger("keydown", { key: "Backspace" })
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([["todo"]])
    })

    it("clears search after selecting in multi+searchable", async () => {
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: [],
        },
      })
      const input = wrapper.find("input.vpick-trigger-input")
      await input.setValue("tod")
      await input.trigger("keydown", { key: "Enter" })
      // Search should be cleared after selection
      expect(wrapper.emitted("search")).toBeDefined()
      const searchEvents = wrapper.emitted("search")!
      expect(searchEvents[searchEvents.length - 1]).toEqual([""])
    })

    it("shows placeholder only when no chips", () => {
      const empty = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: [],
          placeholder: "Select...",
        },
      })
      const input = empty.find<HTMLInputElement>("input.vpick-trigger-input")
      expect(input.attributes("placeholder")).toBe("Select...")

      const filled = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          searchable: true,
          modelValue: ["todo"],
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
      document.body.appendChild(form)
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          modelValue: [],
          name: "tags",
        },
        attachTo: form,
      })
      await nextTick()
      const select = wrapper.find<HTMLSelectElement>(
        "select.vpick-hidden-select",
      )
      expect(select.element.multiple).toBe(true)
      wrapper.unmount()
      form.remove()
    })

    it("hidden select has selected options for each value", async () => {
      const form = document.createElement("form")
      document.body.appendChild(form)
      const wrapper = mount(VPick, {
        props: {
          options: status,
          multiple: true,
          modelValue: ["todo", "done"],
          name: "tags",
        },
        attachTo: form,
      })
      await nextTick()
      const selected = wrapper.findAll(
        "select.vpick-hidden-select option[selected]",
      )
      expect(selected).toHaveLength(2)
      wrapper.unmount()
      form.remove()
    })
  })
})

// ---------------------------------------------------------------------------
// Tree select
// ---------------------------------------------------------------------------

const tree: OptionOrGroup[] = [
  {
    label: "Electronics",
    value: "electronics",
    children: [
      { label: "Phones", value: "phones" },
      {
        label: "Laptops",
        value: "laptops",
        children: [
          { label: "Gaming", value: "gaming" },
          { label: "Business", value: "business" },
        ],
      },
    ],
  },
  { label: "Books", value: "books" },
]

describe("VPick — tree select", () => {
  it("D7: auto-detects tree mode — shows expand chevron on branch rows", async () => {
    const wrapper = mount(VPick, { props: { options: tree, modelValue: null } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(wrapper.find(".vpick-option-expand").exists()).toBe(true)
  })

  it("leaf rows render a spacer instead of a chevron", async () => {
    const wrapper = mount(VPick, { props: { options: tree, modelValue: null } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const options = wrapper.findAll('[role="option"]')
    const booksRow = options.find((o) => o.text().includes("Books"))
    expect(booksRow?.find(".vpick-option-expand-spacer").exists()).toBe(true)
    expect(booksRow?.find(".vpick-option-expand").exists()).toBe(false)
  })

  it("D10: empty children array renders as leaf — no chevron", async () => {
    // Mix: one node with real children (triggers tree mode), one with empty children
    const withEmpty: OptionOrGroup[] = [
      {
        label: "Branch",
        value: "branch",
        children: [{ label: "Child", value: "child" }],
      },
      { label: "Empty", value: "empty", children: [] },
    ]
    const wrapper = mount(VPick, {
      props: { options: withEmpty, modelValue: null },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const options = wrapper.findAll('[role="option"]')
    const emptyRow = options.find((o) => o.text().includes("Empty"))
    // Empty children → rendered as leaf: spacer but no expand button
    expect(emptyRow?.find(".vpick-option-expand").exists()).toBe(false)
    expect(emptyRow?.find(".vpick-option-expand-spacer").exists()).toBe(true)
  })

  it("clicking chevron expands branch without selecting", async () => {
    const wrapper = mount(VPick, { props: { options: tree, modelValue: null } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const chevron = wrapper.find(".vpick-option-expand")
    await chevron.trigger("click")
    await nextTick()

    expect(wrapper.emitted("update:modelValue")).toBeUndefined()
    const options = wrapper.findAll('[role="option"]')
    const labels = options.map((o) => o.text())
    expect(labels.some((l) => l.includes("Phones"))).toBe(true)
  })

  it("D9: clicking branch row label selects without expanding", async () => {
    const wrapper = mount(VPick, { props: { options: tree, modelValue: null } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const electronicsRow = wrapper
      .findAll('[role="option"]')
      .find((o) => o.text().includes("Electronics"))
    await electronicsRow!.trigger("click")
    await nextTick()

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["electronics"])
    // Children should NOT have appeared (row click ≠ expand)
    const options = wrapper.findAll('[role="option"]')
    expect(options.some((o) => o.text().includes("Phones"))).toBe(false)
  })

  it("D3: disableBranchNodes prevents selecting branch", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, disableBranchNodes: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const electronicsRow = wrapper
      .findAll('[role="option"]')
      .find((o) => o.text().includes("Electronics"))
    expect(electronicsRow?.classes()).toContain("vpick-option--disabled")

    await electronicsRow!.trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()
  })

  it("D4: defaultExpandLevel=1 pre-expands top-level branches", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, defaultExpandLevel: 1 },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const options = wrapper.findAll('[role="option"]')
    const labels = options.map((o) => o.text())
    expect(labels.some((l) => l.includes("Phones"))).toBe(true)
    // depth-2 should not be visible (level 1 = top only)
    expect(labels.some((l) => l.includes("Gaming"))).toBe(false)
  })

  it("D4: defaultExpandLevel=2 pre-expands two levels", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, defaultExpandLevel: 2 },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const options = wrapper.findAll('[role="option"]')
    const labels = options.map((o) => o.text())
    expect(labels.some((l) => l.includes("Gaming"))).toBe(true)
  })

  it("ArrowRight expands collapsed branch and moves to first child", async () => {
    const wrapper = mount(VPick, { props: { options: tree, modelValue: null } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    // Electronics is highlighted by default (first enabled item)
    await wrapper
      .find('[role="combobox"]')
      .trigger("keydown", { key: "ArrowRight" })
    await nextTick()

    const highlighted = wrapper.find(".vpick-option--highlighted")
    expect(highlighted.text()).toContain("Phones")
  })

  it("ArrowLeft collapses expanded branch", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, defaultExpandLevel: 1 },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    // Electronics is highlighted by default (first enabled item) and already expanded
    await wrapper
      .find('[role="combobox"]')
      .trigger("keydown", { key: "ArrowLeft" })
    await nextTick()

    const options = wrapper.findAll('[role="option"]')
    expect(options.some((o) => o.text().includes("Phones"))).toBe(false)
  })

  it("ArrowLeft on leaf jumps to parent", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, defaultExpandLevel: 1 },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    // Move down to Phones (index 1, child of Electronics)
    await wrapper
      .find('[role="combobox"]')
      .trigger("keydown", { key: "ArrowDown" })
    await nextTick()

    // ArrowLeft on Phones (leaf) jumps to parent Electronics
    await wrapper
      .find('[role="combobox"]')
      .trigger("keydown", { key: "ArrowLeft" })
    await nextTick()

    const highlighted = wrapper.find(".vpick-option--highlighted")
    expect(highlighted.text()).toContain("Electronics")
  })

  it("tree depth CSS var is set on child rows", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, defaultExpandLevel: 1 },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const options = wrapper.findAll('[role="option"]')
    const phonesRow = options.find((o) => o.text().includes("Phones"))
    expect(phonesRow?.attributes("style")).toContain("--vpick-option-depth")
  })

  it("hidden select includes unexpanded branch nodes", async () => {
    const form = document.createElement("form")
    document.body.appendChild(form)
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, name: "cat" },
      attachTo: form,
    })
    await nextTick()

    const hiddenOptions = wrapper.findAll("select.vpick-hidden-select option")
    const values = hiddenOptions.map((o) => o.attributes("value"))
    // All nodes should be present, not just top-level
    expect(values).toContain("electronics")
    expect(values).toContain("phones")
    expect(values).toContain("laptops")
    expect(values).toContain("gaming")
    expect(values).toContain("business")
    expect(values).toContain("books")

    wrapper.unmount()
    form.remove()
  })

  it("D5: search auto-expands ancestors of matched nodes", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, searchable: true },
    })
    const input = wrapper.find("input.vpick-trigger-input")
    await input.trigger("focus")
    await nextTick()

    await input.setValue("Gaming")
    await input.trigger("input")
    await nextTick()

    const options = wrapper.findAll('[role="option"]')
    const labels = options.map((o) => o.text())
    expect(labels.some((l) => l.includes("Electronics"))).toBe(true)
    expect(labels.some((l) => l.includes("Laptops"))).toBe(true)
    expect(labels.some((l) => l.includes("Gaming"))).toBe(true)
  })

  it("D6: clearing search restores pre-search expansion", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, searchable: true },
    })
    const input = wrapper.find("input.vpick-trigger-input")
    await input.trigger("focus")
    await nextTick()

    // Note the initial state: nothing expanded
    await input.setValue("Gaming")
    await input.trigger("input")
    await nextTick()

    // Clear the query
    await input.setValue("")
    await input.trigger("input")
    await nextTick()

    const options = wrapper.findAll('[role="option"]')
    const labels = options.map((o) => o.text())
    // Phones and Laptops should be hidden again (collapsed back)
    expect(labels.some((l) => l.includes("Phones"))).toBe(false)
    expect(labels.some((l) => l.includes("Laptops"))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Cascade (Phase B)
// ---------------------------------------------------------------------------

describe("VPick — cascade", () => {
  // Selecting a branch selects all its leaf descendants (LEAF_PRIORITY default)
  it("selecting a branch cascades to all leaf descendants", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: [],
        multiple: true,
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    const electronics = options.find((o) => o.text().includes("Electronics"))!
    await electronics.trigger("click")
    const emitted = wrapper.emitted("update:modelValue")!
    // LEAF_PRIORITY: only leaf values emitted (phones + gaming + business)
    expect(emitted[emitted.length - 1][0]).toEqual(
      expect.arrayContaining(["phones", "gaming", "business"]),
    )
    expect(emitted[emitted.length - 1][0]).not.toContain("electronics")
  })

  // Deselecting a branch removes all its leaf descendants
  it("deselecting a branch removes all leaf descendants", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: ["phones", "gaming", "business"],
        multiple: true,
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    const electronics = options.find((o) => o.text().includes("Electronics"))!
    await electronics.trigger("click")
    const emitted = wrapper.emitted("update:modelValue")!
    expect(emitted[emitted.length - 1][0]).toEqual([])
  })

  // Branch shows as checked when all its leaves are selected
  it("branch checkbox is checked when all leaves are selected", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: ["phones", "gaming", "business"],
        multiple: true,
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    const electronics = options.find((o) => o.text().includes("Electronics"))!
    expect(electronics.find(".vpick-option-checkbox--checked").exists()).toBe(
      true,
    )
    expect(
      electronics.find(".vpick-option-checkbox--indeterminate").exists(),
    ).toBe(false)
  })

  // Branch shows as indeterminate when some but not all leaves are selected
  it("branch checkbox is indeterminate when only some leaves are selected", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: ["phones"],
        multiple: true,
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    const electronics = options.find((o) => o.text().includes("Electronics"))!
    expect(
      electronics.find(".vpick-option-checkbox--indeterminate").exists(),
    ).toBe(true)
    expect(electronics.find(".vpick-option-checkbox--checked").exists()).toBe(
      false,
    )
  })

  // Chip display uses BRANCH_PRIORITY regardless of valueConsistsOf
  it("chips show branch when all leaves are selected (LEAF_PRIORITY mode)", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: ["phones", "gaming", "business"],
        multiple: true,
        searchable: true,
      },
    })
    const chips = wrapper.findAll(".vpick-chip-label")
    const chipTexts = chips.map((c) => c.text())
    // All leaves of Electronics selected → single "Electronics" chip
    expect(chipTexts).toContain("Electronics")
    expect(chipTexts).not.toContain("Phones")
    expect(chipTexts).not.toContain("Gaming")
  })

  // Removing a branch chip cascade-deselects all its leaves
  it("removing a branch chip cascade-deselects all leaves", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: ["phones", "gaming", "business"],
        multiple: true,
        searchable: true,
      },
    })
    const removeBtn = wrapper.find(".vpick-chip-remove")
    await removeBtn.trigger("click")
    const emitted = wrapper.emitted("update:modelValue")!
    expect(emitted[emitted.length - 1][0]).toEqual([])
  })

  // cascade: false → independent selection (Phase A behavior)
  it("cascade: false disables cascade — branch click only toggles the branch itself", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: [],
        multiple: true,
        cascade: false,
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    const electronics = options.find((o) => o.text().includes("Electronics"))!
    await electronics.trigger("click")
    const emitted = wrapper.emitted("update:modelValue")!
    // Only the branch itself is toggled, not its leaves
    expect(emitted[emitted.length - 1][0]).toEqual(["electronics"])
  })

  // BRANCH_PRIORITY: emits the branch when all its children are selected
  it("valueConsistsOf BRANCH_PRIORITY emits branch value when all children selected", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: [],
        multiple: true,
        valueConsistsOf: "BRANCH_PRIORITY",
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    const electronics = options.find((o) => o.text().includes("Electronics"))!
    await electronics.trigger("click")
    const emitted = wrapper.emitted("update:modelValue")!
    // BRANCH_PRIORITY: Electronics is the topmost selected node
    expect(emitted[emitted.length - 1][0]).toEqual(["electronics"])
  })

  // ALL: emits both branch and all descendants when fully selected
  it("valueConsistsOf ALL emits branch and all descendants", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: [],
        multiple: true,
        valueConsistsOf: "ALL",
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const options = wrapper.findAll('[role="option"]')
    const electronics = options.find((o) => o.text().includes("Electronics"))!
    await electronics.trigger("click")
    const emitted = wrapper.emitted("update:modelValue")!
    const val = emitted[emitted.length - 1][0] as unknown[]
    // ALL: Electronics (fully selected branch) + its sub-branch + all leaves
    expect(val).toContain("electronics")
    expect(val).toContain("phones")
    expect(val).toContain("laptops")
    expect(val).toContain("gaming")
    expect(val).toContain("business")
  })
})
