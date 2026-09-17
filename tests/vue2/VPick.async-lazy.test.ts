import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import { VPick } from "../../src/vue2"

type Node = { label: string; value: string; children?: Node[] | null }

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
})

afterEach(() => {
  vi.useRealTimers()
})

async function flush() {
  await new Promise((r) => setImmediate(r))
  await nextTick()
}

describe("VPick (Vue 2) — fetchOptions with loadChildren", () => {
  it("keeps unloaded result branches closed until one is opened", async () => {
    const loadChildren = vi.fn(() =>
      Promise.resolve([{ label: "Fiction", value: "fiction" }]),
    )
    const wrapper = mount(VPick, {
      propsData: {
        options: [],
        fetchOptions: () =>
          Promise.resolve([
            { label: "Books", value: "books", children: null },
          ] as Node[]),
        loadChildren,
      },
    })
    await wrapper.find("input").setValue("b")
    await vi.advanceTimersByTimeAsync(300)
    await flush()
    const labels = () =>
      wrapper
        .findAll('[role="option"]')
        .wrappers.map((r) => r.find(".vpick-option-label").text())
    expect(labels()).toEqual(["Books"])
    expect(loadChildren).not.toHaveBeenCalled()

    await wrapper.find(".vpick-option-expand").trigger("click")
    await flush()
    await flush()
    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(labels()).toEqual(["Books", "Fiction"])
  })
})
