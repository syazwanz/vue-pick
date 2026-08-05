import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"
import type { OptionOrGroup } from "../../src/core"

const tree: OptionOrGroup[] = [
  {
    label: "Furniture",
    value: "furniture",
    children: [{ label: "Desks", value: "desks" }],
  },
  {
    label: "Electronics",
    value: "electronics",
    children: [{ label: "Phones", value: "phones" }],
  },
  {
    label: "Books",
    value: "books",
    children: [{ label: "Fiction", value: "fiction" }],
  },
]

async function search(query: string, props: Record<string, unknown> = {}) {
  const wrapper = mount(VPick, {
    propsData: {
      options: tree,
      searchable: true,
      defaultExpandLevel: 1,
      ...props,
    },
  })
  const input = wrapper.find("input")
  ;(input.element as HTMLInputElement).value = query
  await input.trigger("input")
  await nextTick()
  return wrapper.findAll('[role="option"]').wrappers.map((o) => o.text().trim())
}

describe("VPick (Vue 2) — tree search result set", () => {
  it("shows only branches on the path to a match", async () => {
    expect(await search("phones")).toEqual(["Electronics", "Phones"])
  })

  it("hides a branch expanded by defaultExpandLevel with no matching descendant", async () => {
    const rows = await search("phones")
    expect(rows).not.toContain("Furniture")
    expect(rows).not.toContain("Books")
  })

  it("shows a branch whose own label matches, with its subtree", async () => {
    expect(await search("electronics")).toEqual(["Electronics", "Phones"])
  })

  it("leaves flattenSearchResults alone", async () => {
    expect(await search("phones", { flattenSearchResults: true })).toEqual([
      "Phones",
    ])
  })

  it("flattened gives the same rows as nested, minus the ancestors", async () => {
    const flat = { flattenSearchResults: true }
    expect(await search("electronics", flat)).toEqual(
      await search("electronics"),
    )
    expect(await search("electronics", flat)).toEqual(["Electronics", "Phones"])
    expect(await search("phones", flat)).toEqual(["Phones"])
  })

  it("flattened does not depend on disableBranchNodes", async () => {
    expect(
      await search("electronics", {
        flattenSearchResults: true,
        disableBranchNodes: true,
      }),
    ).toEqual(["Electronics", "Phones"])
  })
})

const nested: OptionOrGroup[] = [
  {
    label: "Electronics",
    value: "electronics",
    children: [
      { label: "Phones", value: "phones" },
      { label: "Laptops", value: "laptops" },
      { label: "Tablets", value: "tablets" },
    ],
  },
]

function open(mode: string, value: unknown[] = []) {
  return mount(VPick, {
    propsData: {
      options: nested,
      multiple: true,
      valueConsistsOf: mode,
      value,
      defaultExpandLevel: 1,
    },
  })
}

function selectedLabels(wrapper: ReturnType<typeof open>) {
  return wrapper
    .findAll('[role="option"]')
    .wrappers.filter((r) => r.attributes("aria-selected") === "true")
    .map((r) => r.text().trim())
}

describe("VPick (Vue 2) — ALL_WITH_INDETERMINATE round trip", () => {
  it("ticking one leaf leaves its siblings unticked", async () => {
    const wrapper = open("ALL_WITH_INDETERMINATE")
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const row = wrapper
      .findAll('[role="option"]')
      .wrappers.find((r) => r.text().includes("Phones"))!
    await row.trigger("click")

    const emitted = wrapper.emitted("input")!
    const value = emitted[emitted.length - 1][0] as unknown[]
    expect(value).toEqual(["electronics", "phones"])

    const second = open("ALL_WITH_INDETERMINATE", value)
    await second.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(selectedLabels(second)).toContain("Phones")
    expect(selectedLabels(second)).not.toContain("Laptops")
    expect(selectedLabels(second)).not.toContain("Tablets")
  })

  it("the parent renders indeterminate, not checked", async () => {
    const wrapper = open("ALL_WITH_INDETERMINATE", ["electronics", "phones"])
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const box = wrapper
      .findAll('[role="option"]')
      .wrappers.find((r) => r.text().includes("Electronics"))!
      .find(".vpick-option-checkbox")
    expect(box.classes()).toContain("vpick-option-checkbox--indeterminate")
    expect(box.classes()).not.toContain("vpick-option-checkbox--checked")
  })

  it("ALL still expands a fully-selected branch back to its leaves", async () => {
    const wrapper = open("ALL", ["electronics", "phones", "laptops", "tablets"])
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(selectedLabels(wrapper)).toContain("Laptops")
  })

  it("BRANCH_PRIORITY still expands a branch value to its leaves", async () => {
    const wrapper = open("BRANCH_PRIORITY", ["electronics"])
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(selectedLabels(wrapper)).toContain("Laptops")
  })
})
