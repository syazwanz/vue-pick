import { describe, it, expect, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

type Node = { label: string; value: string; children?: Node[] | null }

// Fresh objects per test: loaded children are cached against the caller's own
// option objects, so sharing them would leak one test's loads into the next.
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

function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function mountTree(props: Record<string, unknown> = {}) {
  return mount(VPick, {
    props: { options: categories(), loadChildren: resolver(), ...props },
  })
}

type Wrapper = ReturnType<typeof mountTree>

async function openList(wrapper: Wrapper) {
  await wrapper.find('[role="combobox"]').trigger("click")
}

function row(wrapper: Wrapper, label: string) {
  const found = wrapper
    .findAll('[role="option"]')
    .find((r) => r.find(".vpick-option-label").text() === label)
  if (!found) throw new Error(`No row labelled ${label}`)
  return found
}

function labels(wrapper: Wrapper) {
  return wrapper
    .findAll('[role="option"]')
    .map((r) => r.find(".vpick-option-label").text())
}

async function expand(wrapper: Wrapper, label: string) {
  await row(wrapper, label).find(".vpick-option-expand").trigger("click")
}

function lastEmitted(wrapper: Wrapper) {
  const all = wrapper.emitted("update:modelValue")
  return all?.[all.length - 1]?.[0]
}

describe("VPick — loadChildren: when it loads", () => {
  it("loads a branch when it is first opened, with the caller's own object", async () => {
    const options = categories()
    const loadChildren = resolver()
    const wrapper = mountTree({ options, loadChildren })
    await openList(wrapper)
    expect(loadChildren).not.toHaveBeenCalled()

    await expand(wrapper, "Books")
    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(loadChildren.mock.calls[0][0]).toBe(options[1])

    await flushPromises()
    expect(labels(wrapper)).toEqual([
      "Electronics",
      "Books",
      "Fiction",
      "History",
      "Gift card",
    ])
  })

  it("loads nothing for a list that is not open", async () => {
    const loadChildren = resolver()
    const wrapper = mountTree({ loadChildren, defaultExpandLevel: 1 })
    await flushPromises()
    expect(loadChildren).not.toHaveBeenCalled()

    await openList(wrapper)
    expect(loadChildren).toHaveBeenCalledTimes(2)
  })

  it("sends one request per branch however often it is opened", async () => {
    const pending = deferred<Node[]>()
    const loadChildren = vi.fn(() => pending.promise)
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)

    await expand(wrapper, "Books")
    await expand(wrapper, "Books")
    await expand(wrapper, "Books")
    expect(loadChildren).toHaveBeenCalledTimes(1)

    pending.resolve(childrenOf.books)
    await flushPromises()
    expect(labels(wrapper)).toContain("History")
  })

  it("does not load again once the children have arrived", async () => {
    const loadChildren = resolver()
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()
    await expand(wrapper, "Books")
    await expand(wrapper, "Books")
    await flushPromises()
    expect(loadChildren).toHaveBeenCalledTimes(1)
  })

  it("treats children: null as a leaf when there is no loadChildren", async () => {
    const wrapper = mount(VPick, { props: { options: categories() } })
    await openList(wrapper)
    expect(wrapper.find(".vpick-option-expand").exists()).toBe(false)
  })
})

describe("VPick — loadChildren: loading and failure", () => {
  it("shows a loading row and a busy branch until the children arrive", async () => {
    const pending = deferred<Node[]>()
    const wrapper = mountTree({ loadChildren: () => pending.promise })
    await openList(wrapper)
    await expand(wrapper, "Books")

    expect(wrapper.find(".vpick-option-empty--loading").text()).toBe(
      "Loading...",
    )
    expect(row(wrapper, "Books").attributes("aria-busy")).toBe("true")

    pending.resolve(childrenOf.books)
    await flushPromises()
    expect(wrapper.find(".vpick-option-empty--loading").exists()).toBe(false)
    expect(row(wrapper, "Books").attributes("aria-busy")).toBeUndefined()
  })

  it("shows the no-children placeholder when a branch loads empty", async () => {
    const wrapper = mountTree({ loadChildren: () => Promise.resolve([]) })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()
    expect(wrapper.find(".vpick-option-empty").text()).toBe("No sub-options")
  })

  it("shows an error row, and clicking it retries", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const loadChildren = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(childrenOf.books)
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()

    const error = wrapper.find(".vpick-option-empty--error")
    expect(error.text()).toBe("Could not load. Click to retry")

    await error.trigger("click")
    await flushPromises()
    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(labels(wrapper)).toContain("History")
    vi.restoreAllMocks()
  })

  it("does not retry a failed branch on its own", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const loadChildren = vi.fn().mockRejectedValue(new Error("offline"))
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()
    await expand(wrapper, "Electronics")
    await flushPromises()

    expect(
      loadChildren.mock.calls.filter((c) => (c[0] as Node).value === "books"),
    ).toHaveLength(1)
    vi.restoreAllMocks()
  })

  it("retries when a failed branch is collapsed and opened again", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const loadChildren = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(childrenOf.books)
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()

    await expand(wrapper, "Books")
    await expand(wrapper, "Books")
    await flushPromises()
    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(labels(wrapper)).toContain("History")
    vi.restoreAllMocks()
  })
})

describe("VPick — loadChildren: ticking an unloaded branch", () => {
  function mountMulti(props: Record<string, unknown> = {}) {
    return mountTree({ multiple: true, modelValue: [], ...props })
  }

  it("loads the branch first, then ticks every leaf", async () => {
    const wrapper = mountMulti()
    await openList(wrapper)
    await row(wrapper, "Books").trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeFalsy()

    await flushPromises()
    expect(lastEmitted(wrapper)).toEqual(["fiction", "history"])
    expect(wrapper.emitted("select")).toHaveLength(1)
  })

  it("loads nested unloaded branches before the tick lands", async () => {
    const loadChildren = resolver()
    const wrapper = mountMulti({ loadChildren })
    await openList(wrapper)
    await row(wrapper, "Electronics").trigger("click")
    await flushPromises()

    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(lastEmitted(wrapper)).toEqual([
      "phones",
      "gaming-laptop",
      "business-laptop",
    ])
  })

  it.each([
    ["ALL", ["books", "fiction", "history"]],
    ["BRANCH_PRIORITY", ["books"]],
    ["ALL_WITH_INDETERMINATE", ["books", "fiction", "history"]],
  ])("emits the %s shape once loaded", async (mode, expected) => {
    const wrapper = mountMulti({ valueConsistsOf: mode })
    await openList(wrapper)
    await row(wrapper, "Books").trigger("click")
    await flushPromises()
    expect(lastEmitted(wrapper)).toEqual(expected)
  })

  it("ignores repeat clicks while the branch is loading", async () => {
    const pending = deferred<Node[]>()
    const wrapper = mountMulti({ loadChildren: () => pending.promise })
    await openList(wrapper)
    await row(wrapper, "Books").trigger("click")
    await row(wrapper, "Books").trigger("click")

    pending.resolve(childrenOf.books)
    await flushPromises()
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1)
  })

  it("leaves the selection alone when the load fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const wrapper = mountMulti({
      loadChildren: () => Promise.reject(new Error("offline")),
    })
    await openList(wrapper)
    await row(wrapper, "Books").trigger("click")
    await flushPromises()
    expect(wrapper.emitted("update:modelValue")).toBeFalsy()
    vi.restoreAllMocks()
  })

  it("unticks without loading anything", async () => {
    const loadChildren = resolver()
    const wrapper = mountMulti({ loadChildren, modelValue: ["books"] })
    await openList(wrapper)
    await row(wrapper, "Books").trigger("click")
    expect(lastEmitted(wrapper)).toEqual([])
    expect(loadChildren).not.toHaveBeenCalled()
  })
})

describe("VPick — loadChildren: values that have not loaded", () => {
  it.each(["LEAF_PRIORITY", "ALL_WITH_INDETERMINATE"])(
    "keeps them when something else is ticked (%s)",
    async (mode) => {
      const wrapper = mountTree({
        multiple: true,
        valueConsistsOf: mode,
        modelValue: ["history"],
      })
      await openList(wrapper)
      await row(wrapper, "Gift card").trigger("click")
      expect(lastEmitted(wrapper)).toEqual(
        expect.arrayContaining(["history", "gift"]),
      )
    },
  )

  it("shows them as a chip that can be removed", async () => {
    const wrapper = mountTree({ multiple: true, modelValue: ["history"] })
    expect(wrapper.find(".vpick-chip").text()).toContain("history")

    await wrapper.find(".vpick-chip-remove").trigger("click")
    expect(lastEmitted(wrapper)).toEqual([])
  })

  it("shows the value in a single-select trigger", () => {
    const wrapper = mountTree({ modelValue: "history" })
    expect(wrapper.find('[role="combobox"]').text()).toContain("history")
  })

  it("submits them with the form", async () => {
    const form = document.createElement("form")
    document.body.appendChild(form)
    const wrapper = mount(VPick, {
      props: {
        options: categories(),
        loadChildren: resolver(),
        multiple: true,
        name: "tags",
        modelValue: ["history"],
      },
      attachTo: form,
    })
    await flushPromises()
    const selected = wrapper.findAll(
      "select.vpick-hidden-select option[selected]",
    )
    expect(selected.map((o) => o.attributes("value"))).toEqual(["history"])
    wrapper.unmount()
    form.remove()
  })
})

describe("VPick — loadChildren: a selected branch that loads later", () => {
  it("becomes its leaves when the value names none of them", async () => {
    const wrapper = mountTree({ multiple: true, modelValue: ["books"] })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()

    expect(wrapper.emitted("update:modelValue")).toHaveLength(1)
    expect(lastEmitted(wrapper)).toEqual(["fiction", "history"])
    expect(wrapper.emitted("select")).toBeFalsy()
  })

  it("keeps the branch and adds its leaves under ALL_WITH_INDETERMINATE", async () => {
    const wrapper = mountTree({
      multiple: true,
      valueConsistsOf: "ALL_WITH_INDETERMINATE",
      modelValue: ["books"],
    })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()
    expect(lastEmitted(wrapper)).toEqual(["books", "fiction", "history"])
  })

  it("leaves the value alone when it already names some of the children", async () => {
    const wrapper = mountTree({
      multiple: true,
      valueConsistsOf: "ALL_WITH_INDETERMINATE",
      modelValue: ["books", "history"],
    })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()

    expect(wrapper.emitted("update:modelValue")).toBeFalsy()
    expect(row(wrapper, "History").attributes("aria-selected")).toBe("true")
    expect(row(wrapper, "Fiction").attributes("aria-selected")).toBe("false")
  })

  it("round-trips: the emitted value renders the same once fed back", async () => {
    const wrapper = mountTree({
      multiple: true,
      valueConsistsOf: "ALL_WITH_INDETERMINATE",
      modelValue: [],
    })
    await openList(wrapper)
    await row(wrapper, "Books").trigger("click")
    await flushPromises()

    await wrapper.setProps({ modelValue: lastEmitted(wrapper) })
    await expand(wrapper, "Books")
    expect(row(wrapper, "Books").attributes("aria-selected")).toBe("true")
    expect(row(wrapper, "Fiction").attributes("aria-selected")).toBe("true")
    expect(row(wrapper, "History").attributes("aria-selected")).toBe("true")
  })
})

describe("VPick — loadChildren: options replaced", () => {
  it("gives a not-yet-loaded chip a raw object, so slots can read it", () => {
    const wrapper = mount(VPick, {
      props: {
        options: categories(),
        loadChildren: resolver(),
        multiple: true,
        modelValue: ["history"],
      },
      slots: {
        "value-label": `<template #value-label="{ option }">{{ option.raw.value }}:{{ option.raw.isAll ? "all" : "one" }}</template>`,
      },
    })
    expect(wrapper.find(".vpick-chip").text()).toContain("history:one")
  })

  it("tries again for fresh options after a branch failed", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const loadChildren = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(childrenOf.books)
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")
    await flushPromises()
    expect(wrapper.find(".vpick-option-empty--error").exists()).toBe(true)

    await wrapper.setProps({ options: categories() })
    await flushPromises()
    expect(wrapper.find(".vpick-option-empty--error").exists()).toBe(false)
    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(labels(wrapper)).toContain("History")
    vi.restoreAllMocks()
  })

  it("loads for fresh options that arrive while a request is still out", async () => {
    const first = deferred<Node[]>()
    const loadChildren = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValue(childrenOf.books)
    const wrapper = mountTree({ loadChildren })
    await openList(wrapper)
    await expand(wrapper, "Books")

    await wrapper.setProps({ options: categories() })
    first.resolve(childrenOf.books)
    await flushPromises()

    expect(loadChildren).toHaveBeenCalledTimes(2)
    expect(labels(wrapper)).toContain("History")
    expect(wrapper.find(".vpick-option-empty--loading").exists()).toBe(false)
  })
})
