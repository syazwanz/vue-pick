import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

type Node = { label: string; value: string; children?: Node[] | null }

// A server that answers searches with categories whose children it sends
// separately, the way a large catalogue API usually does.
function categoriesFor(query: string): Node[] {
  const all: Node[] = [
    { label: "Electronics", value: "electronics", children: null },
    { label: "Books", value: "books", children: null },
    { label: "Gift card", value: "gift" },
  ]
  return all.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()))
}

const childrenOf: Record<string, Node[]> = {
  electronics: [
    { label: "Phones", value: "phones" },
    { label: "Laptops", value: "laptops" },
  ],
  books: [
    { label: "Fiction", value: "fiction" },
    { label: "History", value: "history" },
  ],
}

function mountBoth(props: Record<string, unknown> = {}) {
  const fetchOptions = vi.fn((query: string) =>
    Promise.resolve(categoriesFor(query)),
  )
  const loadChildren = vi.fn((option: unknown) =>
    Promise.resolve(childrenOf[(option as Node).value] ?? []),
  )
  const wrapper = mount(VPick, {
    props: { options: [], fetchOptions, loadChildren, ...props },
    attachTo: document.body,
  })
  return { wrapper, fetchOptions, loadChildren }
}

type Wrapper = ReturnType<typeof mountBoth>["wrapper"]

async function search(wrapper: Wrapper, query: string) {
  await wrapper.find("input").setValue(query)
  await vi.advanceTimersByTimeAsync(300)
  await flushPromises()
}

function rows(wrapper: Wrapper) {
  return wrapper
    .findAll('[role="option"]')
    .map((r) => r.find(".vpick-option-label").text())
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ""
})

function lastEmitted(wrapper: Wrapper) {
  const all = wrapper.emitted("update:modelValue")
  return all?.[all.length - 1]?.[0]
}

async function expand(wrapper: Wrapper, label: string) {
  const row = wrapper
    .findAll('[role="option"]')
    .find((r) => r.find(".vpick-option-label").text() === label)
  if (!row) throw new Error(`No row labelled ${label}`)
  await row.find(".vpick-option-expand").trigger("click")
  await flushPromises()
}

async function tick(wrapper: Wrapper, label: string) {
  const row = wrapper
    .findAll('[role="option"]')
    .find((r) => r.find(".vpick-option-label").text() === label)
  if (!row) throw new Error(`No row labelled ${label}`)
  await row.trigger("click")
  await flushPromises()
}

describe("VPick — fetchOptions with loadChildren", () => {
  it("shows unloaded branches in results closed, and loads nothing on its own", async () => {
    const { wrapper, loadChildren } = mountBoth()
    await search(wrapper, "o")
    expect(rows(wrapper)).toEqual(["Electronics", "Books"])
    expect(loadChildren).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it("loads a result branch once it is opened", async () => {
    const { wrapper, loadChildren } = mountBoth()
    await search(wrapper, "o")
    await expand(wrapper, "Books")
    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(rows(wrapper)).toEqual([
      "Electronics",
      "Books",
      "Fiction",
      "History",
    ])
    wrapper.unmount()
  })

  it("still opens result branches whose children came with the results", async () => {
    const fetchOptions = () =>
      Promise.resolve([
        {
          label: "Books",
          value: "books",
          children: [{ label: "Fiction", value: "fiction" }],
        },
      ])
    const { wrapper } = mountBoth({ fetchOptions })
    await search(wrapper, "b")
    expect(rows(wrapper)).toEqual(["Books", "Fiction"])
    wrapper.unmount()
  })

  it("reuses both the results and the loaded children when a query comes back", async () => {
    const { wrapper, fetchOptions, loadChildren } = mountBoth()
    await search(wrapper, "o")
    await expand(wrapper, "Books")
    await search(wrapper, "oo")
    await search(wrapper, "o")
    await expand(wrapper, "Books")

    expect(fetchOptions).toHaveBeenCalledTimes(2)
    expect(loadChildren).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it("loads an unloaded result branch before ticking its leaves", async () => {
    const { wrapper } = mountBoth({ multiple: true, modelValue: [] })
    await search(wrapper, "o")
    await tick(wrapper, "Books")
    expect(lastEmitted(wrapper)).toEqual(["fiction", "history"])
    wrapper.unmount()
  })

  it("keeps chips for picks from a loaded branch after the results change", async () => {
    const { wrapper } = mountBoth({ multiple: true, modelValue: [] })
    await search(wrapper, "o")
    await expand(wrapper, "Books")
    await tick(wrapper, "History")
    await wrapper.setProps({ modelValue: lastEmitted(wrapper) })

    await search(wrapper, "gift")
    expect(rows(wrapper)).toEqual(["Gift card"])
    expect(wrapper.find(".vpick-chip").text()).toContain("History")

    await tick(wrapper, "Gift card")
    expect(lastEmitted(wrapper)).toEqual(
      expect.arrayContaining(["history", "gift"]),
    )
    wrapper.unmount()
  })

  it("expands a selected result branch into its leaves once it loads", async () => {
    const { wrapper } = mountBoth({ multiple: true, modelValue: ["books"] })
    await search(wrapper, "o")
    await expand(wrapper, "Books")
    expect(lastEmitted(wrapper)).toEqual(["fiction", "history"])
    wrapper.unmount()
  })
})
