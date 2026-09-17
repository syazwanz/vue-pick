import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import VPick from "../src/vue3/VPick.vue"

const people = [
  { id: 1, name: "Ada Lovelace", email: "ada@analytical.org", tags: ["math"] },
  { id: 2, name: "Alan Turing", email: "alan@bletchley.uk", tags: ["codes"] },
  { id: 3, name: "Grace Hopper", email: "grace@navy.mil", tags: ["cobol"] },
]

async function search(query: string, props: Record<string, unknown> = {}) {
  const wrapper = mount(VPick, {
    props: {
      options: people,
      labelKey: "name",
      valueKey: "id",
      searchable: true,
      ...props,
    },
  })
  await wrapper.find('[role="combobox"]').trigger("click")
  await wrapper.find("input").setValue(query)
  await nextTick()
  return wrapper.findAll('[role="option"]').map((o) => o.text())
}

describe("VPick — searchKeys", () => {
  it("searches only the label by default", async () => {
    expect(await search("bletchley")).toEqual([])
  })

  it("also searches the fields it names", async () => {
    expect(await search("bletchley", { searchKeys: ["email"] })).toEqual([
      "Alan Turing",
    ])
    expect(await search("cobol", { searchKeys: ["email", "tags"] })).toEqual([
      "Grace Hopper",
    ])
  })

  it("still matches the label when fields are named", async () => {
    expect(await search("hopper", { searchKeys: ["email"] })).toEqual([
      "Grace Hopper",
    ])
  })

  it("accepts a single key as a string", async () => {
    expect(await search("navy", { searchKeys: "email" })).toEqual([
      "Grace Hopper",
    ])
  })

  it("applies in a tree, opening the path to a field match", async () => {
    const tree = [
      {
        id: "team",
        name: "Team",
        children: [
          { id: "ada", name: "Ada", email: "ada@analytical.org" },
          { id: "alan", name: "Alan", email: "alan@bletchley.uk" },
        ],
      },
    ]
    expect(
      await search("bletchley", { options: tree, searchKeys: ["email"] }),
    ).toEqual(["Team", "Alan"])
  })

  it("is ignored when a custom filter decides instead", async () => {
    const filter = vi.fn(() => false)
    expect(await search("ada", { searchKeys: ["email"], filter })).toEqual([])
    expect(filter).toHaveBeenCalled()
  })
})
