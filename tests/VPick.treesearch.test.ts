import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import VPick from "../src/vue3/VPick.vue"
import type { OptionOrGroup } from "../src/core"

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
    props: { options: tree, searchable: true, defaultExpandLevel: 1, ...props },
  })
  await wrapper.find("input").setValue(query)
  await nextTick()
  return wrapper.findAll('[role="option"]').map((o) => o.text().trim())
}

describe("VPick — tree search result set", () => {
  // `defaultExpandLevel` opens every top-level branch before a key is pressed,
  // so a filter that keeps whatever is expanded keeps the entire tree.
  it("shows only branches on the path to a match", async () => {
    expect(await search("phones")).toEqual(["Electronics", "Phones"])
  })

  it("hides a branch expanded by defaultExpandLevel with no matching descendant", async () => {
    const rows = await search("phones")
    expect(rows).not.toContain("Furniture")
    expect(rows).not.toContain("Books")
  })

  it("finds a match inside a branch that was never expanded", async () => {
    expect(await search("fiction", { defaultExpandLevel: undefined })).toEqual([
      "Books",
      "Fiction",
    ])
  })

  it("shows a branch whose own label matches, with its subtree", async () => {
    expect(await search("electronics")).toEqual(["Electronics", "Phones"])
  })

  it("brings the whole subtree of a self-matched branch, however deep", async () => {
    const deep: OptionOrGroup[] = [
      {
        label: "Electronics",
        value: "electronics",
        children: [
          {
            label: "Phones",
            value: "phones",
            children: [{ label: "Gaming", value: "gaming" }],
          },
        ],
      },
      { label: "Furniture", value: "furniture", children: [] },
    ]
    const wrapper = mount(VPick, {
      props: { options: deep, searchable: true },
    })
    await wrapper.find("input").setValue("electronics")
    await nextTick()
    const rows = wrapper.findAll('[role="option"]').map((o) => o.text().trim())
    expect(rows).toEqual(["Electronics", "Phones", "Gaming"])
  })

  it("shows the empty placeholder when an empty branch matches by name", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [{ label: "Archived", value: "archived", children: [] }],
        searchable: true,
      },
    })
    await wrapper.find("input").setValue("archived")
    await nextTick()
    // The placeholder is inert, so it is not a [role="option"].
    expect(
      wrapper.findAll('[role="option"]').map((o) => o.text().trim()),
    ).toEqual(["Archived"])
    expect(wrapper.find(".vpick-option-empty").exists()).toBe(true)
  })

  it("still reports no results when nothing matches", async () => {
    expect(await search("zzz")).toEqual([])
  })

  it("leaves flattenSearchResults alone", async () => {
    expect(await search("phones", { flattenSearchResults: true })).toEqual([
      "Phones",
    ])
  })
})

// Flattened mode drops the ancestor rows and the indent. It should not also
// drop the subtree a self-matched branch brings, which left a branch label
// query returning a single row and nothing to pick under it.
describe("VPick — flattened search matches the nested result set", () => {
  const flat = { flattenSearchResults: true }

  it("a branch label match brings its subtree, in document order", async () => {
    expect(await search("electronics", flat)).toEqual(["Electronics", "Phones"])
  })

  it("gives the same rows as nested mode, minus the ancestors", async () => {
    const nested = await search("electronics")
    const flattened = await search("electronics", flat)
    expect(flattened).toEqual(nested)
  })

  it("still excludes the ancestors of a leaf match", async () => {
    expect(await search("phones", flat)).toEqual(["Phones"])
    expect(await search("phones")).toEqual(["Electronics", "Phones"])
  })

  it("does not depend on disableBranchNodes", async () => {
    expect(
      await search("electronics", { ...flat, disableBranchNodes: true }),
    ).toEqual(await search("electronics", flat))
  })

  it("shows the placeholder when an empty branch matches by name", async () => {
    const wrapper = mount(VPick, {
      props: {
        options: [{ label: "Archived", value: "archived", children: [] }],
        searchable: true,
        flattenSearchResults: true,
      },
    })
    await wrapper.find("input").setValue("archived")
    await nextTick()
    expect(
      wrapper.findAll('[role="option"]').map((o) => o.text().trim()),
    ).toEqual(["Archived"])
    expect(wrapper.find(".vpick-option-empty").exists()).toBe(true)
  })

  it("still reports nothing when nothing matches", async () => {
    expect(await search("zzz", flat)).toEqual([])
  })
})
