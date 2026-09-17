import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"

describe("VPick (Vue 2) — searchKeys", () => {
  it("also searches the fields it names", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: [
          { id: 1, name: "Ada Lovelace", email: "ada@analytical.org" },
          { id: 2, name: "Alan Turing", email: "alan@bletchley.uk" },
        ],
        labelKey: "name",
        valueKey: "id",
        searchable: true,
        searchKeys: ["email"],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.find("input").setValue("bletchley")
    await nextTick()
    expect(
      wrapper.findAll('[role="option"]').wrappers.map((o) => o.text()),
    ).toEqual(["Alan Turing"])
  })
})
