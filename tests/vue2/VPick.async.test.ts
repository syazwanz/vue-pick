import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"

type Animal = { label: string; value: string }

const cat: Animal = { label: "Cat", value: "cat" }
const dog: Animal = { label: "Dog", value: "dog" }

function server(table: Record<string, Animal[]> = {}) {
  return vi.fn((query: string) => Promise.resolve(table[query] ?? []))
}

function mountAsync(props: Record<string, unknown> = {}) {
  return mount(VPick, {
    propsData: { options: [], fetchOptions: server(), ...props },
  })
}

type Wrapper = ReturnType<typeof mountAsync>

async function flush() {
  await new Promise((r) => setImmediate(r))
  await nextTick()
}

async function type(wrapper: Wrapper, text: string) {
  await wrapper.find("input").setValue(text)
}

async function settle(ms = 300) {
  await vi.advanceTimersByTimeAsync(ms)
  await flush()
}

function rows(wrapper: Wrapper) {
  return wrapper.findAll('[role="option"]').wrappers.map((r) => r.text())
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe("VPick (Vue 2) — fetchOptions", () => {
  it("waits for typing to pause, asks once, and shows the results", async () => {
    const fetchOptions = server({ cat: [cat] })
    const wrapper = mountAsync({ fetchOptions })
    await type(wrapper, "c")
    await type(wrapper, "cat")
    await vi.advanceTimersByTimeAsync(299)
    expect(fetchOptions).not.toHaveBeenCalled()

    await settle(1)
    expect(fetchOptions).toHaveBeenCalledTimes(1)
    expect(rows(wrapper)).toEqual(["Cat"])
  })

  it("shows a searching row while waiting, and a prompt with nothing typed", async () => {
    const wrapper = mountAsync({ fetchOptions: () => new Promise(() => {}) })
    await wrapper.find("input").trigger("click")
    expect(wrapper.find(".vpick-empty").text()).toBe("Type to search")

    await type(wrapper, "cat")
    expect(wrapper.find(".vpick-empty--searching").text()).toBe("Searching...")
    expect(wrapper.find("input").attributes("disabled")).toBeUndefined()
  })

  it("keeps a picked chip and its deselect payload after the results change", async () => {
    const wrapper = mountAsync({
      multiple: true,
      value: [],
      fetchOptions: server({ cat: [cat], dog: [dog] }),
    })
    await type(wrapper, "cat")
    await settle()
    await wrapper.findAll('[role="option"]').at(0).trigger("click")
    const picked = wrapper.emitted("input")!.slice(-1)[0][0]
    await wrapper.setProps({ value: picked })

    await type(wrapper, "dog")
    await settle()
    expect(rows(wrapper)).toEqual(["Dog"])
    expect(wrapper.find(".vpick-chip").text()).toContain("Cat")

    await wrapper.find(".vpick-chip-remove").trigger("click")
    expect(wrapper.emitted("deselect")![0][0]).toBe(cat)
  })
})
