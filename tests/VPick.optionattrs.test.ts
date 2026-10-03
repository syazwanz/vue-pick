import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

const tree = [
  {
    label: "Select all",
    value: "all",
    children: [{ label: "Phones", value: "phones" }],
  },
  { label: "Empty", value: "empty", children: [] },
]

describe("VPick: optionAttrs", () => {
  it("adds the returned attributes to parent and child rows", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree,
        defaultExpandLevel: 1,
        multiple: true,
        optionAttrs: (o: { value: string }) => ({ "data-testid": o.value }),
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const ids = wrapper
      .findAll('[role="option"]')
      .map((r) => r.attributes("data-testid"))
    expect(ids).toEqual(["all", "phones", "empty"])
    // The "no sub-options" placeholder is not an option.
    expect(wrapper.find(".vpick-option-empty").attributes("data-testid")).toBe(
      undefined,
    )
  })

  it("passes the normalized option with the original object as raw", async () => {
    const source = { name: "Todo", id: 7 }
    let seen: unknown
    const wrapper = mount(VPick, {
      props: {
        options: [source],
        labelKey: "name",
        valueKey: "id",
        optionAttrs: (o: unknown) => {
          seen = o
          return {}
        },
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    expect(seen).toMatchObject({ label: "Todo", value: 7 })
    expect((seen as { raw: unknown }).raw).toEqual(source)
  })

  it("works in alwaysOpen mode", () => {
    const wrapper = mount(VPick, {
      props: {
        options: [{ label: "Todo", value: "todo" }],
        alwaysOpen: true,
        optionAttrs: () => ({ "data-testid": "x" }),
      },
    })
    expect(wrapper.find('[role="option"]').attributes("data-testid")).toBe("x")
  })

  it("never overrides core attributes and merges class and style", async () => {
    const onClick = () => {
      throw new Error("bound handler ran")
    }
    const wrapper = mount(VPick, {
      props: {
        options: [{ label: "Todo", value: "todo" }],
        optionAttrs: () => ({
          id: "hijack",
          role: "button",
          tabindex: "0",
          "aria-selected": "true",
          "data-value": "nope",
          onClick,
          class: "mine",
          style: { color: "red" },
        }),
      },
    })
    await wrapper.find('[role="combobox"]').trigger("click")
    const row = wrapper.find(".vpick-option")
    expect(row.attributes("id")).not.toBe("hijack")
    expect(row.attributes("role")).toBe("option")
    expect(row.attributes("tabindex")).toBeUndefined()
    expect(row.attributes("aria-selected")).toBe("false")
    expect(row.attributes("data-value")).toBe("todo")
    expect(row.classes()).toEqual(
      expect.arrayContaining(["mine", "vpick-option"]),
    )
    expect(row.attributes("style")).toContain("color: red")
    await row.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["todo"])
  })
})
