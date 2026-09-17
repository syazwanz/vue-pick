import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"

describe("VPick (Vue 2) — search ignores accents", () => {
  it("finds an accented label from a plain query, in a list and a tree", async () => {
    const options = [
      {
        label: "Pâtisserie",
        value: "patisserie",
        children: [{ label: "Éclair", value: "eclair" }],
      },
      { label: "Café", value: "cafe" },
    ]
    const wrapper = mount(VPick, { propsData: { options, searchable: true } })
    await wrapper.find('[role="combobox"]').trigger("click")

    await wrapper.find("input").setValue("cafe")
    await nextTick()
    expect(
      wrapper.findAll('[role="option"]').wrappers.map((o) => o.text()),
    ).toEqual(["Café"])

    await wrapper.find("input").setValue("eclair")
    await nextTick()
    expect(
      wrapper.findAll('[role="option"]').wrappers.map((o) => o.text()),
    ).toEqual(["Pâtisserie", "Éclair"])
  })
})
