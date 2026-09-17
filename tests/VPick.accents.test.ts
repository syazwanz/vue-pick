import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import VPick from "../src/vue3/VPick.vue"

const flat = [
  { label: "Café", value: "cafe" },
  { label: "Crème brûlée", value: "creme" },
  { label: "Tea", value: "tea" },
]

const tree = [
  {
    label: "Pâtisserie",
    value: "patisserie",
    children: [
      { label: "Éclair", value: "eclair" },
      { label: "Macaron", value: "macaron" },
    ],
  },
  { label: "Drinks", value: "drinks", children: [flat[0], flat[2]] },
]

async function search(
  query: string,
  props: Record<string, unknown> = {},
): Promise<string[]> {
  const wrapper = mount(VPick, {
    props: { options: flat, searchable: true, ...props },
  })
  await wrapper.find('[role="combobox"]').trigger("click")
  await wrapper.find("input").setValue(query)
  await nextTick()
  return wrapper.findAll('[role="option"]').map((o) => o.text())
}

describe("VPick — search ignores accents", () => {
  it("finds an accented label from a plain query", async () => {
    expect(await search("cafe")).toEqual(["Café"])
    expect(await search("creme brulee")).toEqual(["Crème brûlée"])
  })

  it("finds a plain label from an accented query", async () => {
    expect(await search("téa")).toEqual(["Tea"])
  })

  it("applies in a tree, opening the path to the match", async () => {
    expect(await search("eclair", { options: tree })).toEqual([
      "Pâtisserie",
      "Éclair",
    ])
  })

  it("applies across the ancestor path with searchNested", async () => {
    expect(
      await search("patisserie eclair", {
        options: tree,
        searchNested: true,
        flattenSearchResults: true,
      }),
    ).toEqual(["Éclair"])
  })

  it("hands a custom filter the query exactly as typed", async () => {
    const filter = vi.fn(() => true)
    await search("Café", { filter })
    expect(filter).toHaveBeenCalledWith(expect.anything(), "Café")
  })
})
