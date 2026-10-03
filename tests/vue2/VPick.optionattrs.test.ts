import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { VPick } from "../../src/vue2"

describe("VPick (Vue 2): optionAttrs", () => {
  it("adds attributes to tree rows, merges class and keeps core ones", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: [
          {
            label: "Select all",
            value: "all",
            children: [{ label: "Phones", value: "phones" }],
          },
        ],
        defaultExpandLevel: 1,
        multiple: true,
        optionAttrs: (o: { value: string }) => ({
          "data-testid": o.value,
          role: "button",
          "data-value": "nope",
          class: "mine",
        }),
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const rows = wrapper.findAll(".vpick-option").wrappers
    expect(rows.map((r) => r.attributes("data-testid"))).toEqual([
      "all",
      "phones",
    ])
    expect(rows[0].attributes("role")).toBe("option")
    expect(rows[0].attributes("data-value")).toBe("all")
    expect(rows[0].classes()).toEqual(
      expect.arrayContaining(["mine", "vpick-option"]),
    )
  })
})
