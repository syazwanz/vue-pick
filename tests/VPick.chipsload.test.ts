import { describe, it, expect, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

type Node = { label: string; value: string; children?: Node[] | null }

function tree(): Node[] {
  return [
    {
      label: "Electronics",
      value: "electronics",
      children: [
        { label: "Phones", value: "phones" },
        { label: "Laptops", value: "laptops" },
      ],
    },
    { label: "Books", value: "books" },
  ]
}

function chipLabels(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll(".vpick-chip-label").map((c) => c.text())
}

describe("VPick: compactChips", () => {
  it("merges a partial branch away by default", () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree(),
        multiple: true,
        valueConsistsOf: "ALL_WITH_INDETERMINATE",
        modelValue: ["electronics", "phones"],
      },
    })
    expect(chipLabels(wrapper)).toEqual(["Phones"])
  })

  it("shows one chip per value entry when false, half-selected parents included", () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree(),
        multiple: true,
        valueConsistsOf: "ALL_WITH_INDETERMINATE",
        compactChips: false,
        modelValue: ["electronics", "phones"],
      },
    })
    expect(chipLabels(wrapper)).toEqual(["Electronics", "Phones"])
  })

  it("does not merge a fully selected branch when false", () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree(),
        multiple: true,
        compactChips: false,
        modelValue: ["phones", "laptops"],
      },
    })
    expect(chipLabels(wrapper)).toEqual(["Phones", "Laptops"])
  })

  it("unticks everything under a branch chip when it is removed", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: tree(),
        multiple: true,
        valueConsistsOf: "ALL_WITH_INDETERMINATE",
        compactChips: false,
        modelValue: ["electronics", "phones", "books"],
      },
    })
    await wrapper.findAll(".vpick-chip-remove")[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["books"]])
  })
})

const childrenOf: Record<string, Node[]> = {
  electronics: [
    { label: "Phones", value: "phones" },
    { label: "Laptops", value: "laptops" },
  ],
  books: [{ label: "Fiction", value: "fiction" }],
}

function lazyTree(): Node[] {
  return [
    {
      label: "Select all",
      value: "all",
      children: [
        { label: "Electronics", value: "electronics", children: null },
        { label: "Books", value: "books", children: null },
      ],
    },
  ]
}

function rowOf(wrapper: ReturnType<typeof mount>, label: string) {
  const found = wrapper
    .findAll('[role="option"]')
    .find((r) => r.find(".vpick-option-label").text() === label)
  if (!found) throw new Error(`No row labelled ${label}`)
  return found
}

describe("VPick: loadOnSelect", () => {
  function mountLazy(props: Record<string, unknown> = {}) {
    const loadChildren = vi.fn((option: unknown) =>
      Promise.resolve(childrenOf[(option as Node).value] ?? []),
    )
    const wrapper = mount(VPick, {
      props: {
        options: lazyTree(),
        multiple: true,
        defaultExpandLevel: 1,
        loadChildren,
        ...props,
      },
    })
    return { wrapper, loadChildren }
  }

  it("loads every unloaded branch before ticking by default", async () => {
    const { wrapper, loadChildren } = mountLazy()
    await wrapper.find('[role="combobox"]').trigger("click")
    await rowOf(wrapper, "Select all").trigger("click")
    await flushPromises()
    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([
      ["phones", "laptops", "fiction"],
    ])
  })

  it("ticks unloaded branches as their own values with no request when false", async () => {
    const { wrapper, loadChildren } = mountLazy({ loadOnSelect: false })
    await wrapper.find('[role="combobox"]').trigger("click")
    await rowOf(wrapper, "Select all").trigger("click")
    await flushPromises()
    expect(loadChildren).not.toHaveBeenCalled()
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([
      ["electronics", "books"],
    ])
  })

  it("replaces a ticked branch with its children once it is opened", async () => {
    const { wrapper, loadChildren } = mountLazy({ loadOnSelect: false })
    await wrapper.find('[role="combobox"]').trigger("click")
    await rowOf(wrapper, "Electronics").trigger("click")
    const ticked = wrapper.emitted("update:modelValue")?.[0]?.[0]
    expect(ticked).toEqual(["electronics"])
    await wrapper.setProps({ modelValue: ticked })
    expect(rowOf(wrapper, "Electronics").attributes("aria-selected")).toBe(
      "true",
    )
    await rowOf(wrapper, "Electronics")
      .find(".vpick-option-expand")
      .trigger("click")
    await flushPromises()
    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted("update:modelValue")?.slice(-1)[0]).toEqual([
      ["phones", "laptops"],
    ])
  })
})
