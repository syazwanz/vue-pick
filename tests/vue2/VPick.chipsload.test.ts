import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { VPick } from "../../src/vue2"

type Node = { label: string; value: string; children?: Node[] | null }

async function flush() {
  await new Promise((r) => setTimeout(r))
  await new Promise((r) => setTimeout(r))
}

describe("VPick (Vue 2): compactChips and loadOnSelect", () => {
  it("shows one chip per value entry with compactChips false", () => {
    const wrapper = mount(VPick, {
      propsData: {
        options: [
          {
            label: "Electronics",
            value: "electronics",
            children: [
              { label: "Phones", value: "phones" },
              { label: "Laptops", value: "laptops" },
            ],
          },
        ],
        multiple: true,
        valueConsistsOf: "ALL_WITH_INDETERMINATE",
        compactChips: false,
        value: ["electronics", "phones"],
      },
    })
    expect(
      wrapper.findAll(".vpick-chip-label").wrappers.map((c) => c.text()),
    ).toEqual(["Electronics", "Phones"])
  })

  it("ticks an unloaded branch with no request, then emits input with its children once opened", async () => {
    const children: Record<string, Node[]> = {
      electronics: [
        { label: "Phones", value: "phones" },
        { label: "Laptops", value: "laptops" },
      ],
    }
    const loadChildren = vi.fn((option: unknown) =>
      Promise.resolve(children[(option as Node).value] ?? []),
    )
    const wrapper = mount(VPick, {
      propsData: {
        options: [
          { label: "Electronics", value: "electronics", children: null },
        ],
        multiple: true,
        loadChildren,
        loadOnSelect: false,
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    await wrapper.find('[role="option"]').trigger("click")
    await flush()
    expect(loadChildren).not.toHaveBeenCalled()
    expect(wrapper.emitted("input")?.[0]).toEqual([["electronics"]])

    await wrapper.setProps({ value: ["electronics"] })
    await wrapper.find(".vpick-option-expand").trigger("click")
    await flush()
    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted("input")?.slice(-1)[0]).toEqual([
      ["phones", "laptops"],
    ])
  })
})
