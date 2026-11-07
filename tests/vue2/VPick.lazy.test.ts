import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"

type Node = { label: string; value: string; children?: Node[] | null }

function categories(): Node[] {
  return [
    { label: "Electronics", value: "electronics", children: null },
    { label: "Books", value: "books", children: null },
    { label: "Gift card", value: "gift" },
  ]
}

const childrenOf: Record<string, Node[]> = {
  electronics: [
    { label: "Phones", value: "phones" },
    { label: "Laptops", value: "laptops", children: null },
  ],
  laptops: [
    { label: "Gaming laptop", value: "gaming-laptop" },
    { label: "Business laptop", value: "business-laptop" },
  ],
  books: [
    { label: "Fiction", value: "fiction" },
    { label: "History", value: "history" },
  ],
}

function resolver() {
  return vi.fn((option: unknown) =>
    Promise.resolve(childrenOf[(option as Node).value] ?? []),
  )
}

async function flush() {
  await new Promise((r) => setTimeout(r))
  await nextTick()
}

function mountTree(props: Record<string, unknown> = {}) {
  return mount(VPick, {
    propsData: { options: categories(), loadChildren: resolver(), ...props },
  })
}

type Wrapper = ReturnType<typeof mountTree>

async function openList(wrapper: Wrapper) {
  await wrapper.find('[role="combobox"]').trigger("click")
}

function row(wrapper: Wrapper, label: string) {
  const found = wrapper
    .findAll('[role="option"]')
    .wrappers.find((r) => r.find(".vpick-option-label").text() === label)
  if (!found) throw new Error(`No row labelled ${label}`)
  return found
}

function labels(wrapper: Wrapper) {
  return wrapper
    .findAll('[role="option"]')
    .wrappers.map((r) => r.find(".vpick-option-label").text())
}

async function expand(wrapper: Wrapper, label: string) {
  await row(wrapper, label).find(".vpick-option-expand").trigger("click")
}

function lastEmitted(wrapper: Wrapper) {
  const all = wrapper.emitted("input")
  return all?.[all.length - 1]?.[0]
}

describe("VPick (Vue 2) — loadChildren", () => {
  it("loads a branch when it is first opened, with the caller's own object", async () => {
    const options = categories()
    const loadChildren = resolver()
    const wrapper = mountTree({ options, loadChildren })
    await openList(wrapper)
    expect(loadChildren).not.toHaveBeenCalled()

    await expand(wrapper, "Books")
    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(loadChildren.mock.calls[0][0]).toBe(options[1])

    await flush()
    expect(labels(wrapper)).toEqual([
      "Electronics",
      "Books",
      "Fiction",
      "History",
      "Gift card",
    ])
  })

  it("shows a loading row, and an error row that retries on click", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    let fail!: (e: unknown) => void
    const loadChildren = vi
      .fn()
      .mockImplementationOnce(() => new Promise((_, reject) => (fail = reject)))
      .mockResolvedValueOnce(childrenOf.books)
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")
    expect(wrapper.find(".vpick-option-empty--loading").text()).toBe(
      "Loading...",
    )
    expect(row(wrapper, "Books").attributes("aria-busy")).toBe("true")

    fail(new Error("offline"))
    await flush()
    await wrapper.find(".vpick-option-empty--error").trigger("click")
    await flush()
    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(labels(wrapper)).toContain("History")
    vi.restoreAllMocks()
  })

  it("loads an unloaded branch before ticking its leaves", async () => {
    const wrapper = mountTree({ multiple: true, value: [] })
    await openList(wrapper)
    await row(wrapper, "Electronics").trigger("click")
    expect(wrapper.emitted("input")).toBeFalsy()

    await flush()
    await flush()
    expect(lastEmitted(wrapper)).toEqual([
      "phones",
      "gaming-laptop",
      "business-laptop",
    ])
  })

  it("keeps values that have not loaded when something else is ticked", async () => {
    const wrapper = mountTree({
      multiple: true,
      valueConsistsOf: "ALL_WITH_INDETERMINATE",
      value: ["history"],
    })
    await openList(wrapper)
    await row(wrapper, "Gift card").trigger("click")
    expect(lastEmitted(wrapper)).toEqual(
      expect.arrayContaining(["history", "gift"]),
    )
  })

  it("turns a selected branch into its leaves once it loads", async () => {
    const wrapper = mountTree({ multiple: true, value: ["books"] })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flush()
    expect(wrapper.emitted("input")).toHaveLength(1)
    expect(lastEmitted(wrapper)).toEqual(["fiction", "history"])
  })

  it("shows a value that has not loaded as a removable chip", async () => {
    const wrapper = mountTree({ multiple: true, value: ["history"] })
    expect(wrapper.find(".vpick-chip").text()).toContain("history")
    await wrapper.find(".vpick-chip-remove").trigger("click")
    expect(lastEmitted(wrapper)).toEqual([])
  })
})

describe("VPick (Vue 2) — loadChildren: options replaced", () => {
  it("loads for fresh options that arrive while a request is still out", async () => {
    let finish!: (v: Node[]) => void
    const loadChildren = vi
      .fn()
      .mockImplementationOnce(() => new Promise((r) => (finish = r)))
      .mockResolvedValue(childrenOf.books)
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")

    await wrapper.setProps({ options: categories() })
    finish(childrenOf.books)
    await flush()
    await flush()

    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(labels(wrapper)).toContain("History")
  })
})

describe("VPick (Vue 2) — loadChildren: searching", () => {
  function mountSearchable(props: Record<string, unknown> = {}) {
    return mountTree({ searchable: true, ...props })
  }

  async function type(wrapper: Wrapper, query: string) {
    await wrapper.find("input").setValue(query)
    await flush()
  }

  // A loaded branch whose children are all still to be fetched.
  function underLoadedRoot(): Node[] {
    return [{ label: "All categories", value: "all", children: categories() }]
  }

  it("leaves unloaded branches inside a matching loaded branch closed", async () => {
    const loadChildren = resolver()
    const wrapper = mountSearchable({
      loadChildren,
      options: underLoadedRoot(),
    })
    await openList(wrapper)
    await type(wrapper, "categ")
    await flush()

    expect(loadChildren).not.toHaveBeenCalled()
    expect(labels(wrapper)).toEqual([
      "All categories",
      "Electronics",
      "Books",
      "Gift card",
    ])
  })

  it("loads unloaded branches inside a matching loaded branch with loadOnSearch", async () => {
    const loadChildren = resolver()
    const wrapper = mountSearchable({
      loadChildren,
      loadOnSearch: true,
      options: underLoadedRoot(),
    })
    await openList(wrapper)
    await type(wrapper, "categ")
    await flush()

    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(labels(wrapper)).toContain("History")
  })

  it("loads nothing on a keystroke when no branch is loaded", async () => {
    const loadChildren = resolver()
    const wrapper = mountSearchable({ loadChildren })
    await openList(wrapper)
    await type(wrapper, "o")

    expect(loadChildren).not.toHaveBeenCalled()
    expect(labels(wrapper)).toEqual(["Electronics", "Books"])
    expect(wrapper.find(".vpick-option-empty--loading").exists()).toBe(false)
  })

  it("still opens a loaded branch and shows its matches", async () => {
    const loadChildren = resolver()
    const wrapper = mountSearchable({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flush()
    await expand(wrapper, "Books")
    expect(labels(wrapper)).not.toContain("History")

    await type(wrapper, "hist")

    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(labels(wrapper)).toEqual(["Books", "History"])
  })

  it("loads a branch opened by hand during a search", async () => {
    const loadChildren = resolver()
    const wrapper = mountSearchable({ loadChildren })
    await openList(wrapper)
    await type(wrapper, "o")
    await expand(wrapper, "Books")
    await flush()

    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(loadChildren.mock.calls[0][0]).toMatchObject({ value: "books" })
    expect(labels(wrapper)).toContain("History")
  })

  it("opens and loads every matching branch with loadOnSearch", async () => {
    const loadChildren = resolver()
    const wrapper = mountSearchable({ loadChildren, loadOnSearch: true })
    await openList(wrapper)
    await type(wrapper, "o")
    await flush()

    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(labels(wrapper)).toEqual([
      "Electronics",
      "Phones",
      "Laptops",
      "Books",
      "Fiction",
      "History",
    ])
  })
})

// The rule: a search never calls `loadChildren` unless `loadOnSearch` is on.
// Checked across tree shapes rather than one, since each shape reaches the
// open set by a different path: a branch that matches, a branch inside one
// that matches, a branch inside a group, and a mix of loaded and unloaded.
describe("VPick (Vue 2) — loadChildren: search never loads", () => {
  const shapes: Record<string, () => unknown[]> = {
    "unloaded branches at the top": () => categories(),
    "unloaded branches inside a loaded root": () => [
      { label: "All categories", value: "all", children: categories() },
    ],
    "unloaded branches two levels down": () => [
      {
        label: "Store",
        value: "store",
        children: [
          {
            label: "Departments",
            value: "departments",
            children: categories(),
          },
        ],
      },
    ],
    "unloaded branches inside a group": () => [
      { label: "Catalogue", options: categories() },
    ],
    "loaded and unloaded side by side": () => [
      {
        label: "Shelf",
        value: "shelf",
        children: [
          { label: "Atlas", value: "atlas" },
          { label: "Electronics", value: "electronics", children: null },
        ],
      },
      { label: "Books", value: "books", children: null },
    ],
  }

  // Letters in order, gaps allowed: a filter that matches far more than a
  // plain substring does, so most branches match most queries.
  function fuzzy(option: { label: string }, query: string) {
    const q = query.toLowerCase()
    let i = 0
    for (const ch of option.label.toLowerCase()) if (ch === q[i]) i++
    return i === q.length
  }

  const filters: Record<string, Record<string, unknown>> = {
    "default filter": {},
    "fuzzy filter": { filter: fuzzy },
  }
  const layouts: Record<string, Record<string, unknown>> = {
    nested: {},
    flattened: { flattenSearchResults: true },
  }

  // Typed one after another into the same list, ending with a clear.
  const queries = [
    "a",
    "al",
    "all",
    "c",
    "categ",
    "e",
    "o",
    "s",
    "t",
    "store",
    "shelf",
    "dept",
    "x",
    "",
  ]

  for (const [shape, options] of Object.entries(shapes)) {
    for (const [filterName, filterProps] of Object.entries(filters)) {
      for (const [layout, layoutProps] of Object.entries(layouts)) {
        it(`${shape}, ${filterName}, ${layout}`, async () => {
          const loadChildren = resolver()
          const wrapper = mountTree({
            searchable: true,
            loadChildren,
            options: options(),
            ...filterProps,
            ...layoutProps,
          })
          await openList(wrapper)
          for (const query of queries) {
            await wrapper.find("input").setValue(query)
            await flush()
            expect(
              loadChildren,
              `after typing "${query}"`,
            ).not.toHaveBeenCalled()
            expect(
              wrapper.find(".vpick-option-empty--loading").exists(),
              `loading row after typing "${query}"`,
            ).toBe(false)
          }
        })
      }
    }
  }
})
