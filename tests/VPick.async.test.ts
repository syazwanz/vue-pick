import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

type Animal = { label: string; value: string }

const cat: Animal = { label: "Cat", value: "cat" }
const dog: Animal = { label: "Dog", value: "dog" }
const zebra: Animal = { label: "Zebra", value: "zebra" }

function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// Answers from a fixed table, like a server that matches on its own terms.
function server(table: Record<string, Animal[]> = {}) {
  return vi.fn((query: string) => Promise.resolve(table[query] ?? []))
}

function mountAsync(props: Record<string, unknown> = {}) {
  return mount(VPick, {
    props: { options: [], fetchOptions: server(), ...props },
    attachTo: document.body,
  })
}

type Wrapper = ReturnType<typeof mountAsync>

async function type(wrapper: Wrapper, text: string) {
  await wrapper.find("input").setValue(text)
}

async function settle(ms = 300) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}

function rows(wrapper: Wrapper) {
  return wrapper.findAll('[role="option"]').map((r) => r.text())
}

function lastEmitted(wrapper: Wrapper) {
  const all = wrapper.emitted("update:modelValue")
  return all?.[all.length - 1]?.[0]
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ""
})

describe("VPick — fetchOptions: asking", () => {
  it("waits for typing to pause, then asks once for the final query", async () => {
    const fetchOptions = server({ cat: [cat] })
    const wrapper = mountAsync({ fetchOptions })
    await type(wrapper, "c")
    await type(wrapper, "ca")
    await type(wrapper, "cat")

    await vi.advanceTimersByTimeAsync(299)
    expect(fetchOptions).not.toHaveBeenCalled()

    await settle(1)
    expect(fetchOptions).toHaveBeenCalledTimes(1)
    expect(fetchOptions.mock.calls[0][0]).toBe("cat")
    expect(rows(wrapper)).toEqual(["Cat"])
    wrapper.unmount()
  })

  it("honours a custom searchDebounce", async () => {
    const fetchOptions = server()
    const wrapper = mountAsync({ fetchOptions, searchDebounce: 50 })
    await type(wrapper, "cat")
    await settle(50)
    expect(fetchOptions).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it("aborts the older request when the query changes", async () => {
    const signals: (AbortSignal | undefined)[] = []
    const fetchOptions = vi.fn((_q: string, ctx: { signal?: AbortSignal }) => {
      signals.push(ctx.signal)
      return new Promise<Animal[]>(() => {})
    })
    const wrapper = mountAsync({ fetchOptions })
    await type(wrapper, "ca")
    await settle()
    expect(signals[0]?.aborted).toBe(false)

    await type(wrapper, "cat")
    expect(signals[0]?.aborted).toBe(true)
    wrapper.unmount()
  })

  it("ignores a late answer to an older query", async () => {
    const first = deferred<Animal[]>()
    const second = deferred<Animal[]>()
    const fetchOptions = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    const wrapper = mountAsync({ fetchOptions })
    await type(wrapper, "d")
    await settle()
    await type(wrapper, "do")
    await settle()

    second.resolve([dog])
    await flushPromises()
    first.resolve([cat])
    await flushPromises()
    expect(rows(wrapper)).toEqual(["Dog"])
    wrapper.unmount()
  })

  it("does not let a late failure from an older query hide the current one", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const first = deferred<Animal[]>()
    const fetchOptions = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockRejectedValueOnce(new Error("offline"))
    const wrapper = mountAsync({ fetchOptions })
    await type(wrapper, "d")
    await settle()
    await type(wrapper, "do")
    await settle()
    expect(wrapper.find(".vpick-empty--error").exists()).toBe(true)

    first.reject(new Error("late"))
    await flushPromises()
    expect(wrapper.find(".vpick-empty--error").exists()).toBe(true)
    expect(wrapper.find(".vpick-empty--searching").exists()).toBe(false)
    vi.restoreAllMocks()
  })

  it("reuses the answer for a query already asked", async () => {
    const fetchOptions = server({ ca: [cat], cat: [cat] })
    const wrapper = mountAsync({ fetchOptions })
    await type(wrapper, "ca")
    await settle()
    await type(wrapper, "cat")
    await settle()
    await type(wrapper, "ca")
    await settle()

    expect(fetchOptions).toHaveBeenCalledTimes(2)
    expect(rows(wrapper)).toEqual(["Cat"])
    wrapper.unmount()
  })

  it("still emits search on every keystroke", async () => {
    const wrapper = mountAsync()
    await type(wrapper, "c")
    await type(wrapper, "ca")
    expect(wrapper.emitted("search")).toEqual([["c"], ["ca"]])
    wrapper.unmount()
  })
})

describe("VPick — fetchOptions: what the list shows", () => {
  it("keeps the input usable and shows only a searching row while waiting", async () => {
    const wrapper = mountAsync({
      fetchOptions: () => new Promise(() => {}),
      options: [zebra],
    })
    await type(wrapper, "cat")

    expect(wrapper.find("input").attributes("disabled")).toBeUndefined()
    expect(wrapper.find(".vpick-empty--searching").text()).toBe("Searching...")
    expect(wrapper.find('[role="listbox"]').attributes("aria-busy")).toBe(
      "true",
    )
    expect(rows(wrapper)).toEqual([])
    wrapper.unmount()
  })

  it("shows results as the server returned them, without filtering again", async () => {
    const wrapper = mountAsync({ fetchOptions: server({ cat: [zebra] }) })
    await type(wrapper, "cat")
    await settle()
    expect(rows(wrapper)).toEqual(["Zebra"])
    wrapper.unmount()
  })

  it("shows the options prop while nothing is typed", async () => {
    const wrapper = mountAsync({
      options: [zebra],
      fetchOptions: server({ cat: [cat] }),
    })
    await wrapper.find("input").trigger("click")
    expect(rows(wrapper)).toEqual(["Zebra"])

    await type(wrapper, "cat")
    await settle()
    expect(rows(wrapper)).toEqual(["Cat"])

    await type(wrapper, "")
    expect(rows(wrapper)).toEqual(["Zebra"])
    wrapper.unmount()
  })

  it("prompts for a query when nothing is typed and there are no options", async () => {
    const wrapper = mountAsync()
    await wrapper.find("input").trigger("click")
    expect(wrapper.find(".vpick-empty").text()).toBe("Type to search")
    wrapper.unmount()
  })

  it("says no results when the server returns nothing", async () => {
    const wrapper = mountAsync()
    await type(wrapper, "unicorn")
    await settle()
    expect(wrapper.find(".vpick-empty").text()).toBe("No results")
    wrapper.unmount()
  })

  it("shows an error row that asks again on click", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const fetchOptions = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([cat])
    const wrapper = mountAsync({ fetchOptions })
    await type(wrapper, "cat")
    await settle()

    const error = wrapper.find(".vpick-empty--error")
    expect(error.text()).toBe("Could not search. Click to retry")
    await error.trigger("click")
    await flushPromises()
    expect(fetchOptions).toHaveBeenCalledTimes(2)
    expect(rows(wrapper)).toEqual(["Cat"])
    vi.restoreAllMocks()
  })

  it("highlights the first result once it lands, so Enter picks it", async () => {
    const wrapper = mountAsync({ fetchOptions: server({ cat: [cat, zebra] }) })
    await type(wrapper, "cat")
    await settle()
    await wrapper.find("input").trigger("keydown", { key: "Enter" })
    expect(lastEmitted(wrapper)).toBe("cat")
    wrapper.unmount()
  })
})

describe("VPick — fetchOptions: selections outlive the results", () => {
  it("keeps a chip, and its deselect payload, after the results change", async () => {
    const wrapper = mountAsync({
      multiple: true,
      modelValue: [],
      fetchOptions: server({ cat: [cat], dog: [dog] }),
    })
    await type(wrapper, "cat")
    await settle()
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    await wrapper.setProps({ modelValue: lastEmitted(wrapper) })

    await type(wrapper, "dog")
    await settle()
    expect(rows(wrapper)).toEqual(["Dog"])
    expect(wrapper.find(".vpick-chip").text()).toContain("Cat")

    await wrapper.find(".vpick-chip-remove").trigger("click")
    expect(wrapper.emitted("deselect")?.[0]?.[0]).toBe(cat)
    wrapper.unmount()
  })

  it("keeps the single-select label once the results are gone", async () => {
    const wrapper = mountAsync({
      fetchOptions: server({ cat: [cat], dog: [dog] }),
    })
    await type(wrapper, "cat")
    await settle()
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    await wrapper.setProps({ modelValue: "cat" })

    // While typing, a single-select input shows its current pick as the
    // placeholder. Cat is not in the results for "dog".
    await type(wrapper, "dog")
    await settle()
    expect(rows(wrapper)).toEqual(["Dog"])
    expect(wrapper.find("input").attributes("placeholder")).toBe("Cat")
    wrapper.unmount()
  })

  it("hands back the remembered object in object format", async () => {
    const wrapper = mountAsync({
      multiple: true,
      valueFormat: "object",
      modelValue: [],
      fetchOptions: server({ cat: [cat], dog: [dog] }),
    })
    await type(wrapper, "cat")
    await settle()
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    await wrapper.setProps({ modelValue: lastEmitted(wrapper) })

    await type(wrapper, "dog")
    await settle()
    await wrapper.findAll('[role="option"]')[0].trigger("click")
    expect(lastEmitted(wrapper)).toEqual([cat, dog])
    wrapper.unmount()
  })

  it("submits a pick that is no longer in the results", async () => {
    document.body.innerHTML = ""
    const form = document.createElement("form")
    document.body.appendChild(form)
    const wrapper = mount(VPick, {
      props: {
        options: [],
        fetchOptions: server({ dog: [dog] }),
        multiple: true,
        name: "pets",
        modelValue: ["cat"],
      },
      attachTo: form,
    })
    await type(wrapper, "dog")
    await settle()
    const selected = wrapper.findAll(
      "select.vpick-hidden-select option[selected]",
    )
    expect(selected.map((o) => o.attributes("value"))).toEqual(["cat"])
    wrapper.unmount()
  })
})
