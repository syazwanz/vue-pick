import { describe, it, expect, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

const opts = [
  { label: "Apple", value: "apple" },
  { label: "Pear", value: "pear" },
  { label: "Plum", value: "plum" },
]

const classes = {
  trigger: "x-trigger",
  input: "x-input",
  chips: "x-chips",
  chip: "x-chip",
  chipLabel: "x-chip-label",
  chipRemove: "x-chip-remove",
  clear: "x-clear",
  positioner: "x-positioner",
  listbox: "x-listbox",
  option: "x-option",
  optionLabel: "x-option-label",
  optionCheckbox: "x-option-checkbox",
}

afterEach(() => {
  document.body
    .querySelectorAll('.vpick-positioner, [role="listbox"]')
    .forEach((n) => n.remove())
})

describe("VPick: classes", () => {
  it("adds each part class next to the built-in one", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: opts,
        multiple: true,
        searchable: true,
        clearable: true,
        modelValue: ["apple"],
        classes,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const pairs: [string, string][] = [
      [".vpick-trigger", "x-trigger"],
      [".vpick-trigger-input", "x-input"],
      [".vpick-chips", "x-chips"],
      [".vpick-chip", "x-chip"],
      [".vpick-chip-label", "x-chip-label"],
      [".vpick-chip-remove", "x-chip-remove"],
      [".vpick-clear", "x-clear"],
      [".vpick-positioner", "x-positioner"],
      [".vpick-listbox", "x-listbox"],
      [".vpick-option", "x-option"],
      [".vpick-option-label", "x-option-label"],
      [".vpick-option-checkbox", "x-option-checkbox"],
    ]
    for (const [part, cls] of pairs) {
      expect(wrapper.find(part).classes(), part).toContain(cls)
    }
  })

  it("keeps the chip class through select, deselect and re-render", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: opts,
        multiple: true,
        animate: false,
        modelValue: ["apple"],
        classes: { chip: "x-chip" },
        "onUpdate:modelValue": (v: unknown) =>
          wrapper.setProps({ modelValue: v as string[] }),
      },
    })
    const chips = () => wrapper.findAll(".vpick-chip")
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.findAll('[role="option"]')[1].trigger("click")
    expect(chips()).toHaveLength(2)
    expect(chips().every((c) => c.classes("x-chip"))).toBe(true)
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(chips()).toHaveLength(1)
    await wrapper.setProps({ options: [...opts] })
    expect(chips().every((c) => c.classes("x-chip"))).toBe(true)
  })

  it("takes a function for chip and option", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: opts,
        multiple: true,
        modelValue: ["apple", "pear"],
        classes: {
          chip: (o: { value: string }) =>
            o.value === "apple" ? "x-hidden" : undefined,
          option: (o: { value: string }) => `x-${o.value}`,
        },
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const chips = wrapper.findAll(".vpick-chip")
    expect(chips[0].classes()).toContain("x-hidden")
    expect(chips[1].classes()).not.toContain("x-hidden")
    expect(
      wrapper
        .findAll('[role="option"]')
        .map((r) => r.classes()[r.classes().length - 1]),
    ).toEqual(["x-apple", "x-pear", "x-plum"])
  })

  it("puts listbox and positioner classes on the teleported panel", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts, classes },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const positioner = document.body.querySelector(".x-positioner")
    expect(positioner).not.toBe(null)
    expect(wrapper.element.contains(positioner)).toBe(false)
    expect(positioner!.querySelector(".x-listbox")).not.toBe(null)
    wrapper.unmount()
  })

  it("adds nothing when the prop is not set", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts, multiple: true, modelValue: ["apple"] },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const all = [wrapper.element, ...wrapper.element.querySelectorAll("*")]
    for (const el of all) {
      for (const c of el.classList) {
        expect(c.startsWith("vpick")).toBe(true)
      }
    }
  })
})

describe("VPick: state attributes", () => {
  it("marks the trigger open or closed", async () => {
    const wrapper = mount(VPick, { props: { options: opts } })
    const trigger = wrapper.find(".vpick-trigger")
    expect(trigger.attributes("data-state")).toBe("closed")
    await trigger.trigger("click")
    expect(trigger.attributes("data-state")).toBe("open")
  })

  it("marks the search trigger open or closed", async () => {
    const wrapper = mount(VPick, { props: { options: opts, searchable: true } })
    const trigger = wrapper.find(".vpick-trigger")
    expect(trigger.attributes("data-state")).toBe("closed")
    await wrapper.find("input").trigger("click")
    expect(trigger.attributes("data-state")).toBe("open")
  })

  it("marks only the highlighted option", async () => {
    const wrapper = mount(VPick, { props: { options: opts } })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper
      .find('[role="combobox"]')
      .trigger("keydown", { key: "ArrowDown" })
    const marked = wrapper
      .findAll('[role="option"]')
      .filter((r) => r.attributes("data-highlighted") !== undefined)
    expect(marked).toHaveLength(1)
    expect(marked[0].classes()).toContain("vpick-option--highlighted")
  })

  it("marks the checkbox checked, indeterminate or unchecked", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [
          {
            label: "Fruit",
            value: "fruit",
            children: [
              { label: "Apple", value: "apple" },
              { label: "Pear", value: "pear" },
            ],
          },
        ],
        multiple: true,
        defaultExpandLevel: 1,
        modelValue: ["apple"],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const states = wrapper
      .findAll(".vpick-option-checkbox")
      .map((c) => c.attributes("data-state"))
    expect(states).toEqual(["indeterminate", "checked", "unchecked"])
  })
})
