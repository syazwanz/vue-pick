import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import Fuse from "fuse.js"
import { Document } from "flexsearch"
import VPick from "../src/vue3/VPick.vue"

// The integrations the search engine guides document. These pin the wiring,
// not the engines: VPick has to keep the engine's order and show its results on
// the keystroke.

type Person = { id: number; name: string; email: string }

const people: Person[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@analytical.org" },
  { id: 2, name: "Alan Turing", email: "alan@bletchley.uk" },
  { id: 3, name: "Grace Hopper", email: "grace@navy.mil" },
]

async function typeInto(options: Record<string, unknown>, query: string) {
  const wrapper = mount(VPick, {
    props: {
      options: [],
      labelKey: "name",
      valueKey: "id",
      searchDebounce: 0,
      ...options,
    },
  })
  await wrapper.find("input").setValue(query)
  await nextTick()
  return wrapper.findAll('[role="option"]').map((o) => o.text())
}

describe("search engine guides: Fuse.js", () => {
  const fuse = new Fuse(people, {
    keys: ["name", "email"],
    threshold: 0.4,
  })
  const fetchOptions = (query: string) =>
    fuse.search(query).map((result) => result.item)

  it("finds a match despite a typo", async () => {
    expect(await typeInto({ fetchOptions }, "lovlace")).toEqual([
      "Ada Lovelace",
    ])
  })

  it("searches the other keys it was given", async () => {
    const rows = await typeInto({ fetchOptions }, "navy")
    expect(rows[0]).toBe("Grace Hopper")
  })

  it("keeps Fuse's ranking", async () => {
    const ranked = fuse.search("a").map((r) => r.item.name)
    expect(await typeInto({ fetchOptions }, "a")).toEqual(ranked)
  })
})

describe("search engine guides: FlexSearch", () => {
  type Product = { id: number; title: string; description: string }
  const products: Product[] = [
    { id: 1, title: "Trail shoes", description: "For running on rough ground" },
    { id: 2, title: "Road shoes", description: "Light, for runners on tarmac" },
    { id: 3, title: "Rain jacket", description: "Keeps you dry on long walks" },
    { id: 5, title: "Head torch", description: "For running after dark" },
  ]
  const index = new Document<Product>({
    document: { id: "id", index: ["title", "description"], store: true },
    tokenize: "forward",
  })
  for (const product of products) index.add(product)

  const fetchOptions = (query: string) =>
    index
      .search(query, { merge: true, enrich: true, suggest: true })
      .map((result) => result.doc)

  const props = { fetchOptions, labelKey: "title", valueKey: "id" }

  it("matches the start of a word, in any indexed field", async () => {
    expect(await typeInto(props, "run")).toEqual(
      expect.arrayContaining(["Trail shoes", "Road shoes", "Head torch"]),
    )
  })

  it("keeps FlexSearch's ranking", async () => {
    const ranked = fetchOptions("shoes rough").map((doc) => doc!.title)
    expect(ranked[0]).toBe("Trail shoes")
    expect(await typeInto(props, "shoes rough")).toEqual(ranked)
  })
})
