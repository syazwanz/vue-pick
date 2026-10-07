import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"

const opts = [
  { label: "Apple", value: "apple" },
  { label: "Pear", value: "pear" },
]

describe("VPick (Vue 2): classes", () => {
  it("adds part classes, including on the moved panel", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: opts,
        multiple: true,
        value: ["apple", "pear"],
        classes: {
          trigger: "x-trigger",
          chip: (o: { value: string }) => `x-chip-${o.value}`,
          positioner: "x-positioner",
          listbox: "x-listbox",
          option: "x-option",
        },
      },
      attachTo: document.body,
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(wrapper.find(".vpick-trigger").classes()).toContain("x-trigger")
    expect(
      wrapper.findAll(".vpick-chip").wrappers.map((c) => c.classes()),
    ).toEqual([
      expect.arrayContaining(["x-chip-apple"]),
      expect.arrayContaining(["x-chip-pear"]),
    ])
    expect(
      document.body.querySelector(".vpick-positioner.x-positioner"),
    ).not.toBe(null)
    expect(document.body.querySelector(".vpick-listbox.x-listbox")).not.toBe(
      null,
    )
    expect(wrapper.find(".vpick-option").classes()).toContain("x-option")
    wrapper.destroy()
  })

  it("adds state attributes", async () => {
    const wrapper = mount(VPick, { propsData: { options: opts } })
    const trigger = wrapper.find(".vpick-trigger")
    expect(trigger.attributes("data-state")).toBe("closed")
    await trigger.trigger("click")
    await trigger.trigger("keydown", { key: "ArrowDown" })
    expect(trigger.attributes("data-state")).toBe("open")
    expect(
      wrapper
        .findAll('[role="option"]')
        .wrappers.filter((r) => r.attributes("data-highlighted") !== undefined),
    ).toHaveLength(1)
  })
})
