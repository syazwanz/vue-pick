import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

describe("VPick — data-value on option rows", () => {
  it("puts each option's value on its row", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [
          { label: "Todo", value: "todo" },
          { label: "Five", value: 5 },
        ],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const values = wrapper
      .findAll('[role="option"]')
      .map((r) => r.attributes("data-value"))
    expect(values).toEqual(["todo", "5"])
  })

  it("marks branch and leaf rows alike in a tree", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [
          {
            label: "Select all",
            value: "all",
            children: [{ label: "Phones", value: "phones" }],
          },
        ],
        defaultExpandLevel: 1,
        multiple: true,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(wrapper.find('[role="option"][data-value="all"]').exists()).toBe(
      true,
    )
    expect(wrapper.find('[role="option"][data-value="phones"]').exists()).toBe(
      true,
    )
  })

  it("leaves it off when the value is not a string, number or boolean", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [{ label: "Object", value: { id: 1 } }],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(
      wrapper.find('[role="option"]').attributes("data-value"),
    ).toBeUndefined()
  })
})
