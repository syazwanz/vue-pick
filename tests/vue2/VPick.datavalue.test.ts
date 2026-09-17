import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { VPick } from "../../src/vue2"

describe("VPick (Vue 2) — data-value on option rows", () => {
  it("puts each primitive value on its row and leaves objects off", async () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: [
          { label: "Todo", value: "todo" },
          { label: "Five", value: 5 },
          { label: "Object", value: { id: 1 } },
        ],
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const values = wrapper
      .findAll('[role="option"]')
      .wrappers.map((r) => r.attributes("data-value"))
    expect(values).toEqual(["todo", "5", undefined])
  })
})
