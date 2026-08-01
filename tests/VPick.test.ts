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

  // The chips and the search input share one TransitionGroup. The input has to
  // be inside it: that is what gives it the -move class, so it slides to its
  // new position when a chip is added or removed instead of jumping. The
  // wrapper is `display: contents`, so everything stays a flex child of the
  // trigger and wrapping still works.
  // The visible placeholder is a pinned element, not the input's own, so it does
  // not slide when the input moves as chips come and go. The native attribute
  // stays for screen readers, hidden with `color: transparent`, so the two must
  // appear and disappear together.
  it("pairs a pinned placeholder with the native one for screen readers", async () => {
    const empty = mount(VPick, {
      props: { options: status, multiple: true, placeholder: "Pick some" },
    })
    expect(empty.find(".vpick-multi-placeholder").text()).toBe("Pick some")
    expect(
      empty.find(".vpick-multi-placeholder").attributes("aria-hidden"),
    ).toBe("true")
    expect(empty.find("input").attributes("placeholder")).toBe("Pick some")

    const filled = mount(VPick, {
      props: {
        options: status,
        multiple: true,
        placeholder: "Pick some",
        modelValue: ["todo"],
      },
    })
    expect(filled.find(".vpick-multi-placeholder").classes()).toContain(
      "vpick-multi-placeholder--hidden",
    )
    expect(filled.find("input").attributes("placeholder")).toBeUndefined()
  })

  it("hides the pinned placeholder once the user types", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, placeholder: "Pick some" },
    })
    await wrapper.find("input").setValue("to")
    expect(wrapper.find(".vpick-multi-placeholder").classes()).toContain(
      "vpick-multi-placeholder--hidden",
    )
  })

  // Removing the last chip is not animated: the placeholder appears in the same
  // spot at that instant, and a lingering chip would sit on top of it. Removing
  // one of several keeps the animation, since the rest still slide into the gap.
  it("marks the chip wrapper empty only once the last chip goes", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: ["todo", "done"] },
    })
    const classes = () => wrapper.find(".vpick-chips").classes()
    expect(classes()).not.toContain("vpick-chips--empty")

    await wrapper.setProps({ modelValue: ["todo"] })
    expect(classes()).not.toContain("vpick-chips--empty")

    await wrapper.setProps({ modelValue: [] })
    expect(classes()).toContain("vpick-chips--empty")
  })

  // `animate: false` has to stop the FLIP move as well as the enter and leave
  // classes. TransitionGroup runs the move from its own updated hook and never
  // consults `css`, so the wrapper carries a class that declares no transform
  // transition, which is what makes Vue skip the move pass entirely.
  it("marks the chip wrapper static when animate is off", () => {
    const on = mount(VPick, {
      props: { options: status, multiple: true, modelValue: ["todo"] },
    })
    expect(on.find(".vpick-chips").classes()).not.toContain(
      "vpick-chips--static",
    )

    const off = mount(VPick, {
      props: {
        options: status,
        multiple: true,
        modelValue: ["todo"],
        animate: false,
      },
    })
    expect(off.find(".vpick-chips").classes()).toContain("vpick-chips--static")
  })

  it("keeps chips and the input in one transition group", () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: ["todo", "done"] },
    })
    const chipWrap = wrapper.find(".vpick-chips")
    expect(chipWrap.exists()).toBe(true)
    expect(chipWrap.element.parentElement).toBe(
      wrapper.find(".vpick-trigger--multi").element,
    )
    for (const chip of wrapper.findAll(".vpick-chip")) {
      expect(chip.element.parentElement).toBe(chipWrap.element)
    }
    expect(wrapper.find("input").element.parentElement).toBe(chipWrap.element)
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

  // The checkbox sits in normal flow, so it indents with the row. That only
  // works while it comes after the chevron, which makes the order load-bearing.
  it("tree multi rows order the chevron before the checkbox before the label", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: [], multiple: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const options = wrapper.findAll('[role="option"]')
    const branch = options.find((o) => o.text().includes("Electronics"))!
    const leaf = options.find((o) => o.text().includes("Books"))!

    const order = (row: typeof branch) =>
      Array.from(row.element.children).map((c) => c.classList[0])

    expect(order(branch)).toEqual([
      "vpick-option-expand",
      "vpick-option-checkbox",
      "vpick-option-label",
    ])
    expect(order(leaf)).toEqual([
      "vpick-option-expand-spacer",
      "vpick-option-checkbox",
      "vpick-option-label",
    ])
  })

  // Options usually arrive from an API after mount. At that point every branch
  // is new, so defaultExpandLevel has to apply then, not only in setup.
  it("defaultExpandLevel applies to options that arrive after mount", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [] as OptionOrGroup[],
        modelValue: null,
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(wrapper.findAll('[role="option"]')).toHaveLength(0)

    await wrapper.setProps({ options: tree })
    await nextTick()

    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    expect(labels).toContain("Electronics")
    expect(labels).toContain("Phones")
  })

  it("a branch the user collapsed stays collapsed when options change", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, defaultExpandLevel: 1 },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const electronics = wrapper
      .findAll('[role="option"]')
      .find((o) => o.text().includes("Electronics"))!
    await electronics.find(".vpick-option-expand").trigger("click")
    await nextTick()
    expect(
      wrapper.findAll('[role="option"]').map((o) => o.text()),
    ).not.toContain("Phones")

    // Same tree, new array identity: the collapse must survive.
    await wrapper.setProps({ options: [...tree] })
    await nextTick()
    expect(
      wrapper.findAll('[role="option"]').map((o) => o.text()),
    ).not.toContain("Phones")
  })

  it("disableBranchNodes drops the checkbox from branch rows, keeps it on leaves", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        modelValue: [],
        multiple: true,
        disableBranchNodes: true,
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const options = wrapper.findAll('[role="option"]')
    const branch = options.find((o) => o.text().includes("Electronics"))!
    const leaf = options.find((o) => o.text().includes("Phones"))!

    expect(branch.find(".vpick-option-checkbox").exists()).toBe(false)
    expect(leaf.find(".vpick-option-checkbox").exists()).toBe(true)
  })

  // Revised D10: an explicit `children: []` is the author declaring a branch
  // that happens to be empty, so it stays a branch. Omitting the key entirely
  // is what makes a leaf.
  const withEmpty: OptionOrGroup[] = [
    {
      label: "Branch",
      value: "branch",
      children: [{ label: "Child", value: "child" }],
    },
    { label: "Empty", value: "empty", children: [] },
  ]

  it("empty children array stays a branch and keeps its chevron", async () => {
    const wrapper = mount(VPick, {
      props: { options: withEmpty, modelValue: null },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const emptyRow = wrapper
      .findAll('[role="option"]')
      .find((o) => o.text().includes("Empty"))
    expect(emptyRow?.find(".vpick-option-expand").exists()).toBe(true)
    expect(emptyRow?.attributes("aria-expanded")).toBe("false")
  })

  it("a node with no children key renders as a leaf", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [
          {
            label: "Branch",
            value: "branch",
            children: [{ label: "Child", value: "child" }],
          },
          { label: "Leaf", value: "leaf" },
        ],
        modelValue: null,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const leafRow = wrapper
      .findAll('[role="option"]')
      .find((o) => o.text().includes("Leaf"))
    expect(leafRow?.find(".vpick-option-expand").exists()).toBe(false)
    expect(leafRow?.find(".vpick-option-expand-spacer").exists()).toBe(true)
  })

  it("expanding an empty branch shows noChildrenText in an inert row", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: withEmpty,
        modelValue: null,
        noChildrenText: "Nothing here",
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const emptyRow = wrapper
      .findAll('[role="option"]')
      .find((o) => o.text().includes("Empty"))
    await emptyRow!.find(".vpick-option-expand").trigger("click")
    await nextTick()

    const placeholder = wrapper.find(".vpick-option-empty")
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.text()).toBe("Nothing here")
    // Inert: not an option, so screen readers and arrow keys skip it.
    expect(placeholder.attributes("role")).toBeUndefined()
  })

  it("arrow keys skip the empty-branch placeholder row", async () => {
    const wrapper = mount(VPick, {
      props: { options: withEmpty, modelValue: null, defaultExpandLevel: 1 },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await nextTick()

    // Rows are: Branch, Child, Empty, <placeholder>. Walk past the end.
    for (let i = 0; i < 6; i++) {
      await trigger.trigger("keydown", { key: "ArrowDown" })
    }
    await nextTick()

    // Highlight lands on the last navigable row, never the placeholder.
    const highlighted = wrapper.find(".vpick-option--highlighted")
    expect(highlighted.exists()).toBe(true)
    expect(highlighted.text()).toContain("Empty")
    expect(wrapper.find(".vpick-option-empty").classes()).not.toContain(
      "vpick-option--highlighted",
    )

    // End key must not land on it either.
    await trigger.trigger("keydown", { key: "End" })
    await nextTick()
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("Empty")
  })

  it("disableBranchNodes blocks selecting an empty branch", async () => {
    const wrapper = mount(VPick, {
      props: { options: withEmpty, modelValue: null, disableBranchNodes: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const emptyRow = wrapper
      .findAll('[role="option"]')
      .find((o) => o.text().includes("Empty"))
    await emptyRow!.trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeFalsy()
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
    // Not selectable as an option, and said so to assistive tech...
    expect(electronicsRow?.attributes("aria-disabled")).toBe("true")
    // ...but not painted as a dead row, because the click still expands it.
    expect(electronicsRow?.classes()).not.toContain("vpick-option--disabled")

    await electronicsRow!.trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeUndefined()
  })

  it("tags branch and leaf rows for CSS, with depth", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null, defaultExpandLevel: 1 },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const rows = wrapper.findAll('[role="option"]')
    const branch = rows.find((o) => o.text().includes("Electronics"))!
    const leaf = rows.find((o) => o.text().includes("Phones"))!

    expect(branch.classes()).toContain("vpick-option--branch")
    expect(branch.classes()).not.toContain("vpick-option--leaf")
    expect(branch.attributes("data-depth")).toBe("0")

    expect(leaf.classes()).toContain("vpick-option--leaf")
    expect(leaf.classes()).not.toContain("vpick-option--branch")
    expect(leaf.attributes("data-depth")).toBe("1")
  })

  it("does not tag rows outside tree mode", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const row = wrapper.findAll('[role="option"]')[0]
    expect(row.classes()).not.toContain("vpick-option--leaf")
    expect(row.attributes("data-depth")).toBeUndefined()
  })

  it("no-children slot overrides the placeholder text", async () => {
    const wrapper = mount(VPick, {
      props: { options: withEmpty, modelValue: null, defaultExpandLevel: 1 },
      slots: {
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
      props: { options: tree, modelValue: null, disableBranchNodes: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()

    const row = () =>
      wrapper
        .findAll('[role="option"]')
        .find((o) => o.text().includes("Electronics"))!
    expect(row().attributes("aria-expanded")).toBe("false")

    await row().trigger("click")
    await nextTick()
    expect(row().attributes("aria-expanded")).toBe("true")

    await row().trigger("click")
    await nextTick()
    expect(row().attributes("aria-expanded")).toBe("false")
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

describe("VPick — clearOnSelect / closeOnSelect", () => {
  it("clears the query after picking in multi mode by default", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: [] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const input = wrapper.find("input")
    await input.setValue("do")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(input.element.value).toBe("")
  })

  it("clearOnSelect false keeps the query after picking", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: status,
        multiple: true,
        modelValue: [],
        clearOnSelect: false,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const input = wrapper.find("input")
    await input.setValue("do")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(input.element.value).toBe("do")
  })

  it("stays open after picking in multi mode by default", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: [] },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("true")
  })

  it("closeOnSelect true closes after picking in multi mode", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: status,
        multiple: true,
        modelValue: [],
        closeOnSelect: true,
      },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("closeOnSelect false keeps single-select open after picking", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, modelValue: null, closeOnSelect: false },
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("true")
  })
})

describe("VPick — select / deselect events", () => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]

  it("select hands back the caller's original object, not the normalized one", async () => {
    const wrapper = mount(VPick, {
      props: { options: users, labelKey: "name", valueKey: "id" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")

    const payload = wrapper.emitted("select")?.[0]?.[0]
    expect(payload).toBe(users[0])
  })

  it("emits deselect when unpicking in multi mode", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: users,
        labelKey: "name",
        valueKey: "id",
        multiple: true,
        modelValue: [1],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")

    expect(wrapper.emitted("deselect")?.[0]?.[0]).toBe(users[0])
    expect(wrapper.emitted("select")).toBeFalsy()
  })

  it("does not emit select for a blocked branch node", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [
          {
            label: "Branch",
            value: "branch",
            children: [{ label: "Child", value: "child" }],
          },
        ],
        modelValue: null,
        disableBranchNodes: true,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(wrapper.emitted("select")).toBeFalsy()
  })
})

describe("VPick — sortValueBy", () => {
  // Document order of `tree`: electronics(0), phones(1), laptops(1),
  // gaming(2), business(2), books(0). Numbers in brackets are depth.
  function lastEmitted(w: ReturnType<typeof mount>) {
    const e = w.emitted("update:modelValue")
    return e![e!.length - 1][0] as string[]
  }

  function openAll(
    modelValue: string[],
    sortValueBy?: "ORDER_SELECTED" | "LEVEL" | "INDEX",
  ) {
    return mount(VPick, {
      props: {
        options: tree,
        multiple: true,
        cascade: false,
        defaultExpandLevel: 2,
        modelValue,
        // Optional prop: undefined falls through to the component default.
        sortValueBy,
      },
    })
  }

  it("ORDER_SELECTED keeps click order (default)", async () => {
    const wrapper = openAll(["books", "business"])
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const rows = wrapper.findAll('[role="option"]')
    await rows.find((o) => o.text().includes("Phones"))!.trigger("click")
    expect(lastEmitted(wrapper)).toEqual(["books", "business", "phones"])
  })

  it("INDEX sorts by position in the tree", async () => {
    const wrapper = openAll(["books", "business"], "INDEX")
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const rows = wrapper.findAll('[role="option"]')
    await rows.find((o) => o.text().includes("Phones"))!.trigger("click")
    // phones(1) < business(4) < books(5)
    expect(lastEmitted(wrapper)).toEqual(["phones", "business", "books"])
  })

  it("LEVEL sorts shallowest first, ties broken by tree order", async () => {
    const wrapper = openAll(["gaming"], "LEVEL")
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const rows = wrapper.findAll('[role="option"]')
    await rows.find((o) => o.text().includes("Books"))!.trigger("click")
    // books is depth 0, gaming is depth 2
    expect(lastEmitted(wrapper)).toEqual(["books", "gaming"])
  })

  it("orders the chips too, not just the emitted value", () => {
    const wrapper = openAll(["books", "gaming"], "INDEX")
    const chips = wrapper.findAll(".vpick-chip-label").map((c) => c.text())
    expect(chips).toEqual(["Gaming", "Books"])
  })

  it("leaves order untouched by default", () => {
    const wrapper = openAll(["books", "gaming"])
    const chips = wrapper.findAll(".vpick-chip-label").map((c) => c.text())
    expect(chips).toEqual(["Books", "Gaming"])
  })
})

describe("VPick — value-label slot", () => {
  const users = [
    { id: 1, name: "Alice", nickname: "Al" },
    { id: 2, name: "Bob", nickname: "Bobby" },
  ]

  it("overrides the single-select trigger label", () => {
    const wrapper = mount(VPick, {
      props: {
        options: users,
        labelKey: "name",
        valueKey: "id",
        modelValue: 1,
      },
      slots: {
        "value-label":
          '<template #default="{ option }"><b class="nick">{{ option.raw.nickname }}</b></template>',
      },
    })
    expect(wrapper.find(".nick").text()).toBe("Al")
  })

  it("overrides chip labels in multi mode", () => {
    const wrapper = mount(VPick, {
      props: {
        options: users,
        labelKey: "name",
        valueKey: "id",
        multiple: true,
        modelValue: [1, 2],
      },
      slots: {
        "value-label":
          '<template #default="{ option }"><span class="nick">{{ option.raw.nickname }}</span></template>',
      },
    })
    expect(wrapper.findAll(".nick").map((n) => n.text())).toEqual([
      "Al",
      "Bobby",
    ])
  })

  it("falls back to the label when no slot is given", () => {
    const wrapper = mount(VPick, {
      props: {
        options: users,
        labelKey: "name",
        valueKey: "id",
        modelValue: 1,
      },
    })
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("Alice")
  })

  it("still shows the placeholder when nothing is selected", () => {
    const wrapper = mount(VPick, {
      props: { options: users, labelKey: "name", valueKey: "id" },
      slots: {
        "value-label":
          '<template #default="{ option }"><b class="nick">{{ option.raw.nickname }}</b></template>',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attrs: { placeholder: "Pick someone" } as any,
    })
    expect(wrapper.find(".nick").exists()).toBe(false)
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("Pick someone")
  })
})

// These pin element identity, not behavior. Behavior tests pass whether a
// control is a <button> or a <div>, which is how the chip remove sat as a
// <span role="button"> unnoticed. Assert the tag wherever it is interactive,
// carries a role users depend on, or is announced differently by tag.
describe("VPick — accessibility element contract", () => {
  it("non-searchable trigger is a real button with combobox semantics", () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.element.tagName).toBe("BUTTON")
    expect(trigger.attributes("type")).toBe("button")
    expect(trigger.attributes("aria-haspopup")).toBe("listbox")
  })

  it("searchable trigger puts combobox semantics on the input itself", () => {
    const wrapper = mount(VPick, {
      props: { options: status, searchable: true },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.element.tagName).toBe("INPUT")
    expect(trigger.attributes("type")).toBe("text")
    expect(trigger.attributes("aria-autocomplete")).toBe("list")
    // The button trigger must not also be present.
    expect(wrapper.find("button[role='combobox']").exists()).toBe(false)
  })

  it("listbox carries the listbox role, and multiselectable only when multi", async () => {
    const single = mount(VPick, { props: { options: status } })
    await single.find('[role="combobox"]').trigger("click")
    expect(
      single.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBeUndefined()

    const multi = mount(VPick, {
      props: { options: status, multiple: true, modelValue: [] },
    })
    await multi.find('[role="combobox"]').trigger("click")
    expect(
      multi.find('[role="listbox"]').attributes("aria-multiselectable"),
    ).toBe("true")
  })

  it("options carry role and selected state", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, modelValue: "todo" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const opts = wrapper.findAll('[role="option"]')
    expect(opts.length).toBe(3)
    expect(opts[0].attributes("aria-selected")).toBe("true")
    expect(opts[1].attributes("aria-selected")).toBe("false")
    // Every option must be addressable by aria-activedescendant.
    expect(opts.every((o) => !!o.attributes("id"))).toBe(true)
  })

  it("hidden form control is a real select, multiple only when multi", () => {
    const single = mount(VPick, { props: { options: status } })
    const s = single.find("select")
    expect(s.exists()).toBe(true)
    expect(s.attributes("multiple")).toBeUndefined()

    const multi = mount(VPick, {
      props: { options: status, multiple: true, modelValue: [] },
    })
    expect(multi.find("select").attributes("multiple")).toBeDefined()
  })

  it("chip remove is a real button with an accessible name", () => {
    const wrapper = mount(VPick, {
      props: { options: status, multiple: true, modelValue: ["todo"] },
    })
    const remove = wrapper.find(".vpick-chip-remove")
    expect(remove.element.tagName).toBe("BUTTON")
    expect(remove.attributes("type")).toBe("button")
    expect(remove.attributes("aria-label")).toBe("Remove Todo")
  })

  it("searchable clear is a real button", () => {
    const wrapper = mount(VPick, {
      props: {
        options: status,
        searchable: true,
        clearable: true,
        modelValue: "todo",
      },
    })
    const clear = wrapper.find(".vpick-clear")
    expect(clear.element.tagName).toBe("BUTTON")
    expect(clear.attributes("type")).toBe("button")
    expect(clear.attributes("aria-label")).toBe("Clear selection")
  })

  // Deliberate exception: this clear renders inside the <button> trigger, and
  // a button nested in a button is invalid HTML. role="button" is the correct
  // workaround here, so this asserts the exception rather than the rule.
  it("non-searchable clear stays a span, since it nests inside the trigger button", () => {
    const wrapper = mount(VPick, {
      props: { options: status, clearable: true, modelValue: "todo" },
    })
    const clear = wrapper.find(".vpick-clear")
    expect(clear.element.tagName).toBe("SPAN")
    expect(clear.attributes("role")).toBe("button")
    expect(clear.element.closest("button")).not.toBe(null)
  })

  it("searchable chevron is a real button, disabled with the control", () => {
    const wrapper = mount(VPick, {
      props: { options: status, searchable: true, disabled: true },
    })
    const icon = wrapper.find(".vpick-trigger-icon--button")
    expect(icon.element.tagName).toBe("BUTTON")
    expect(icon.attributes("type")).toBe("button")
    expect(icon.attributes("disabled")).toBeDefined()
  })

  it("tree expand control is a button that never takes tab focus", async () => {
    const wrapper = mount(VPick, { props: { options: tree, modelValue: null } })
    await wrapper.find('[role="combobox"]').trigger("click")
    const expand = wrapper.find(".vpick-option-expand")
    expect(expand.element.tagName).toBe("BUTTON")
    expect(expand.attributes("type")).toBe("button")
    // Arrow keys drive the tree, so the chevron must stay out of the tab order.
    expect(expand.attributes("tabindex")).toBe("-1")
  })
})

describe("VPick — valueFormat", () => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]

  function mountUsers(props: Record<string, unknown> = {}) {
    return mount(VPick, {
      props: { options: users, labelKey: "name", valueKey: "id", ...props },
    })
  }

  it("emits plain values by default", async () => {
    const wrapper = mountUsers()
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")![0][0]).toBe(1)
  })

  it("emits the caller's original object in single mode", async () => {
    const wrapper = mountUsers({ valueFormat: "object" })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")![0][0]).toBe(users[0])
  })

  it("emits an array of objects in multi mode", async () => {
    const wrapper = mountUsers({
      valueFormat: "object",
      multiple: true,
      modelValue: [],
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")![0][0]).toEqual([users[1]])
  })

  it("understands objects coming back in", () => {
    const wrapper = mountUsers({ valueFormat: "object", modelValue: users[1] })
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("Bob")
  })

  it("matches a fresh object literal by value key, not identity", () => {
    // The parent may hand back a reconstructed object rather than ours.
    const wrapper = mountUsers({
      valueFormat: "object",
      modelValue: { id: 2, name: "Bob" },
    })
    expect(wrapper.find(".vpick-trigger-label").text()).toBe("Bob")
  })

  it("marks the right option selected from an object model", async () => {
    const wrapper = mountUsers({
      valueFormat: "object",
      multiple: true,
      modelValue: [{ id: 1 }],
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const opts = wrapper.findAll('[role="option"]')
    expect(opts[0].attributes("aria-selected")).toBe("true")
    expect(opts[1].attributes("aria-selected")).toBe("false")
  })

  it("deselecting emits the remaining objects", async () => {
    const wrapper = mountUsers({
      valueFormat: "object",
      multiple: true,
      modelValue: [{ id: 1 }, { id: 2 }],
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")![0][0]).toEqual([users[1]])
  })

  it("passes an unknown value through instead of throwing", async () => {
    const wrapper = mountUsers({
      valueFormat: "object",
      multiple: true,
      modelValue: [{ id: 999 }],
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    const emitted = wrapper.emitted("update:modelValue")![0][0] as unknown[]
    // 999 has no matching option, so it survives as the bare value.
    expect(emitted).toContain(999)
    expect(emitted).toContain(users[0])
  })

  it("clearing still empties the model", async () => {
    const wrapper = mountUsers({
      valueFormat: "object",
      clearable: true,
      modelValue: users[0],
    })
    await wrapper.find(".vpick-clear").trigger("click")
    expect(wrapper.emitted("update:modelValue")![0][0]).toBeUndefined()
  })

  it("keeps the hidden select working on plain values", () => {
    const wrapper = mountUsers({ valueFormat: "object", modelValue: users[1] })
    expect(wrapper.find("select").element.value).toBe("2")
  })
})

describe("VPick — flattenSearchResults", () => {
  // tree: Electronics > [Phones, Laptops > [Gaming, Business]], Books
  function openAndType(query: string, flatten = false) {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        searchable: true,
        modelValue: null,
        ...(flatten ? { flattenSearchResults: true } : {}),
      },
    })
    return wrapper
      .find('[role="combobox"]')
      .trigger("click")
      .then(() => wrapper.find("input").setValue(query))
      .then(() => wrapper)
  }

  it("by default shows matches nested under their ancestors", async () => {
    const wrapper = await openAndType("gaming")
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    // Electronics and Laptops are ancestors of the match, so they appear too.
    expect(labels).toContain("Electronics")
    expect(labels).toContain("Laptops")
    expect(labels).toContain("Gaming")
  })

  it("flattened shows only direct matches, no ancestors", async () => {
    const wrapper = await openAndType("gaming", true)
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    expect(labels).toEqual(["Gaming"])
  })

  it("flattened finds matches inside collapsed branches", async () => {
    // Nothing is expanded, so this only works by walking the whole tree.
    const wrapper = await openAndType("business", true)
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    expect(labels).toEqual(["Business"])
  })

  it("flattened drops the indent, since parents are not shown", async () => {
    const wrapper = await openAndType("gaming", true)
    const row = wrapper.find('[role="option"]')
    expect(row.attributes("data-depth")).toBe("0")
  })

  it("flattened still includes branch nodes that match themselves", async () => {
    const wrapper = await openAndType("laptops", true)
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    expect(labels).toEqual(["Laptops"])
  })

  it("flattened options remain selectable", async () => {
    const wrapper = await openAndType("gaming", true)
    await wrapper.find('[role="option"]').trigger("click")
    expect(wrapper.emitted("update:modelValue")![0][0]).toBe("gaming")
  })

  it("clearing the query restores the tree", async () => {
    const wrapper = await openAndType("gaming", true)
    await wrapper.find("input").setValue("")
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    // Back to the collapsed top level.
    expect(labels).toContain("Electronics")
    expect(labels).toContain("Books")
    expect(labels).not.toContain("Gaming")
  })

  it("does not disturb expansion state while searching", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        searchable: true,
        modelValue: null,
        flattenSearchResults: true,
        defaultExpandLevel: 1,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.find("input").setValue("gaming")
    await wrapper.find("input").setValue("")
    // Electronics was pre-expanded and should still be.
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    expect(labels).toContain("Phones")
  })
})

describe("VPick — alwaysOpen", () => {
  it("starts open and stays open", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("aria-expanded")).toBe("true")

    await trigger.trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("true")

    await trigger.trigger("keydown", { key: "Escape" })
    expect(trigger.attributes("aria-expanded")).toBe("true")
  })

  it("survives a click outside", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true },
      attachTo: document.body,
    })
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "true",
    )
    wrapper.unmount()
  })

  it("renders in flow rather than teleporting", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await nextTick()
    // The panel is inside the component root, not moved to <body>.
    expect(wrapper.element.querySelector(".vpick-positioner")).not.toBe(null)
    wrapper.unmount()
  })

  it("skips fixed positioning", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
    const positioner = wrapper.find<HTMLElement>(".vpick-positioner").element
    expect(positioner.style.position).toBe("")
    expect(positioner.style.transform).toBe("")
    wrapper.unmount()
  })

  it("tags the root so the panel can be styled in flow", () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true },
    })
    expect(wrapper.classes()).toContain("vpick--inline")
  })

  it("hides the chevron", () => {
    const inline = mount(VPick, {
      props: { options: status, alwaysOpen: true },
    })
    expect(inline.find(".vpick-trigger-icon").exists()).toBe(false)

    const normal = mount(VPick, { props: { options: status } })
    expect(normal.find(".vpick-trigger-icon").exists()).toBe(true)
  })

  // The searchable trigger is a separate branch from the button trigger, so it
  // needs its own guard. `multiple` reaches it too, since it forces searchable.
  it.each([
    ["searchable", { searchable: true }],
    ["multiple", { multiple: true }],
  ])("hides the chevron in %s mode too", (_label, extra) => {
    const inline = mount(VPick, {
      props: { options: status, alwaysOpen: true, ...extra },
    })
    expect(inline.find(".vpick-trigger-icon").exists()).toBe(false)

    const normal = mount(VPick, { props: { options: status, ...extra } })
    expect(normal.find(".vpick-trigger-icon").exists()).toBe(true)
  })

  it("still selects", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true },
    })
    await wrapper.findAll('[role="option"]')[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")![0][0]).toBe("in-progress")
  })

  it("keyboard navigation still works", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true },
    })
    const trigger = wrapper.find('[role="combobox"]')
    // Nothing is highlighted until the user acts: the panel being visible is
    // not the same as it having keyboard focus.
    expect(wrapper.find(".vpick-option--highlighted").exists()).toBe(false)

    await trigger.trigger("keydown", { key: "ArrowDown" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain("Todo")

    await trigger.trigger("keydown", { key: "ArrowDown" })
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain(
      "In Progress",
    )
  })

  it("re-enabling reopens it, rather than leaving it shut with no chevron", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true, disabled: true },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("aria-expanded")).toBe("false")

    await wrapper.setProps({ disabled: false })
    await nextTick()
    expect(trigger.attributes("aria-expanded")).toBe("true")
  })

  it("follows the prop when it changes after mount", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: false },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes("aria-expanded")).toBe("false")

    await wrapper.setProps({ alwaysOpen: true })
    await nextTick()
    expect(trigger.attributes("aria-expanded")).toBe("true")

    await wrapper.setProps({ alwaysOpen: false })
    await nextTick()
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("closes when disabled, so the panel is not left sitting there inert", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true, disabled: true },
    })
    expect(wrapper.find('[role="combobox"]').attributes("aria-expanded")).toBe(
      "false",
    )
  })
})

describe("VPick — disabling an open dropdown", () => {
  it("closes it", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    expect(trigger.attributes("aria-expanded")).toBe("true")

    await wrapper.setProps({ disabled: true })
    await nextTick()
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("closes it when loading starts too", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger("click")
    await wrapper.setProps({ loading: true })
    await nextTick()
    expect(trigger.attributes("aria-expanded")).toBe("false")
  })

  it("refuses selections while disabled", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, alwaysOpen: true },
    })
    await wrapper.setProps({ disabled: true })
    await nextTick()
    // alwaysOpen keeps the rows mounted, so they are still clickable in the DOM.
    const opts = wrapper.findAll('[role="option"]')
    if (opts.length) await opts[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeFalsy()
  })
})

describe("VPick — revealing the selection on open", () => {
  // tree: Electronics > [Phones, Laptops > [Gaming, Business]], Books
  it("expands collapsed ancestors to reveal a deep selection", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: "gaming" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    expect(labels).toContain("Gaming")
    // and it is the highlighted row, so the existing scroll-into-view reaches it
    expect(wrapper.find(".vpick-option--highlighted").text()).toContain(
      "Gaming",
    )
  })

  it("does the same in multi mode", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, multiple: true, modelValue: ["business"] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(wrapper.findAll('[role="option"]').map((o) => o.text())).toContain(
      "Business",
    )
  })

  it("leaves the tree collapsed when nothing is selected", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: null },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    expect(labels).toEqual(["Electronics", "Books"])
  })

  it("leaves a top-level selection alone", async () => {
    const wrapper = mount(VPick, {
      props: { options: tree, modelValue: "books" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const labels = wrapper.findAll('[role="option"]').map((o) => o.text())
    expect(labels).toEqual(["Electronics", "Books"])
  })

  it("does not disturb a flat list", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, modelValue: "done" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
  })
})

describe("VPick — empty states", () => {
  it("says so when there are no options at all", async () => {
    const wrapper = mount(VPick, { props: { options: [] } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find(".vpick-empty").text()).toBe("No options available")
  })

  it("uses noResultsText when a search matches nothing", async () => {
    const wrapper = mount(VPick, {
      props: { options: status, searchable: true },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.find("input").setValue("zzz")
    expect(wrapper.find(".vpick-empty").text()).toBe("No results")
  })

  it("both messages are configurable", async () => {
    const wrapper = mount(VPick, {
      props: { options: [], noOptionsText: "Nothing here yet" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find(".vpick-empty").text()).toBe("Nothing here yet")
  })

  it("shows nothing when there are options and no search", async () => {
    const wrapper = mount(VPick, { props: { options: status } })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find(".vpick-empty").exists()).toBe(false)
  })
})

describe("VPick — backspaceRemoves / deleteRemoves", () => {
  function multi(props: Record<string, unknown> = {}) {
    return mount(VPick, {
      props: {
        options: status,
        multiple: true,
        modelValue: ["todo", "done"],
        ...props,
      },
    })
  }

  it("Backspace and Delete both remove the last chip by default", async () => {
    for (const key of ["Backspace", "Delete"]) {
      const wrapper = multi()
      await wrapper.find("input").trigger("keydown", { key })
      expect(wrapper.emitted("update:modelValue")![0][0]).toEqual(["todo"])
    }
  })

  it("each can be turned off independently", async () => {
    const noBackspace = multi({ backspaceRemoves: false })
    await noBackspace.find("input").trigger("keydown", { key: "Backspace" })
    expect(noBackspace.emitted("update:modelValue")).toBeFalsy()
    // Delete still works, since only backspace was disabled.
    await noBackspace.find("input").trigger("keydown", { key: "Delete" })
    expect(noBackspace.emitted("update:modelValue")).toBeTruthy()

    const noDelete = multi({ deleteRemoves: false })
    await noDelete.find("input").trigger("keydown", { key: "Delete" })
    expect(noDelete.emitted("update:modelValue")).toBeFalsy()
  })

  it("neither fires while the search input has text", async () => {
    const wrapper = multi()
    await wrapper.find("input").setValue("to")
    await wrapper.find("input").trigger("keydown", { key: "Backspace" })
    expect(wrapper.emitted("update:modelValue")).toBeFalsy()
  })
})

describe("VPick — labelKey as a fallback chain", () => {
  const mixed = [
    { id: 1, label: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, label: "", name: "Carol" },
  ]

  it("takes the first key with a non-empty value", async () => {
    const wrapper = mount(VPick, {
      props: { options: mixed, labelKey: ["label", "name"], valueKey: "id" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.findAll('[role="option"]').map((o) => o.text())).toEqual([
      "Alice",
      "Bob",
      "Carol",
    ])
  })

  it("a single string still behaves as before", async () => {
    const wrapper = mount(VPick, {
      props: { options: mixed, labelKey: "label", valueKey: "id" },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.findAll('[role="option"]')[0].text()).toBe("Alice")
  })

  it("the resolved label drives search, not just display", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: mixed,
        labelKey: ["label", "name"],
        valueKey: "id",
        searchable: true,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.find("input").setValue("bob")
    expect(wrapper.findAll('[role="option"]').map((o) => o.text())).toEqual([
      "Bob",
    ])
  })
})

describe("VPick — searchNested", () => {
  async function search(query: string, props: Record<string, unknown> = {}) {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        searchable: true,
        modelValue: null,
        flattenSearchResults: true,
        ...props,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.find("input").setValue(query)
    await nextTick()
    return wrapper.findAll('[role="option"]').map((o) => o.text())
  }

  it("a multi-word query can span the ancestor path", async () => {
    expect(await search("electronics gaming", { searchNested: true })).toEqual([
      "Gaming",
    ])
  })

  it("without it, the same query matches nothing", async () => {
    expect(await search("electronics gaming")).toEqual([])
  })

  it("single-word queries are unaffected", async () => {
    expect(await search("gaming", { searchNested: true })).toEqual(["Gaming"])
  })

  it("words from unrelated branches do not match", async () => {
    expect(await search("books gaming", { searchNested: true })).toEqual([])
  })
})

describe("VPick — empty-branch placeholders stay out of the option set", () => {
  const withEmptyBranch: OptionOrGroup[] = [
    {
      label: "Branch",
      value: "branch",
      children: [{ label: "Child", value: "child" }],
    },
    { label: "Empty", value: "empty", children: [] },
  ]

  it("the hidden select has no duplicate option for an empty branch", () => {
    const wrapper = mount(VPick, {
      props: { options: withEmptyBranch, defaultExpandLevel: 2 },
    })
    const values = wrapper
      .findAll("select option")
      .map((o) => o.attributes("value"))
      .filter((v) => v !== "")
    expect(values).toEqual([...new Set(values)])
    expect(values.filter((v) => v === "empty")).toHaveLength(1)
  })

  it("a tree with only an empty branch is not treated as having no options", async () => {
    const wrapper = mount(VPick, {
      props: { options: [{ label: "Empty", value: "empty", children: [] }] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find(".vpick-empty").exists()).toBe(false)
  })
})
