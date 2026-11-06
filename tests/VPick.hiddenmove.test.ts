import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

const options = [
  { label: "Alpha", value: "a" },
  { label: "Bravo", value: "b" },
]

// jsdom has no layout, so the transition group never runs its move pass here.
// The test stands in for it: one chip reports a zero rect (what `display:
// none` gives) and carries the move class the group would have added.
function setup(hiddenIndex: number) {
  const wrapper = mount(VPick, {
    props: { options, multiple: true, modelValue: ["a", "b"] },
    attachTo: document.body,
  })
  const chips = wrapper.findAll(".vpick-chip").map((c) => c.element)
  chips.forEach((el, i) => {
    el.getBoundingClientRect = () =>
      (i === hiddenIndex
        ? { width: 0, height: 0, top: 0, left: 0 }
        : { width: 60, height: 21, top: 10, left: 10 }) as DOMRect
    el.classList.add("vpick-chip-move")
  })
  return { wrapper, chips }
}

function transitionWrites(el: Element) {
  const writes: string[] = []
  const store: Record<string, string> = { transition: "page-value" }
  vi.spyOn(el as HTMLElement, "style", "get").mockReturnValue(
    new Proxy({} as CSSStyleDeclaration, {
      get: (_, key) => store[key as string] ?? "",
      set(_, key, value) {
        if (key === "transition") writes.push(value)
        store[key as string] = value
        return true
      },
    }),
  )
  return writes
}

describe("VPick: hidden chip move", () => {
  it("cancels the move of a chip that had no size before the update", async () => {
    const { wrapper, chips } = setup(0)
    const hiddenWrites = transitionWrites(chips[0])
    const visibleWrites = transitionWrites(chips[1])

    await wrapper.setProps({ placeholder: "changed" })

    expect(hiddenWrites).toEqual(["none", "page-value"])
    expect(visibleWrites).toEqual([])
    wrapper.unmount()
  })

  it("leaves a chip alone when the group did not move it", async () => {
    const { wrapper, chips } = setup(0)
    chips[0].classList.remove("vpick-chip-move")
    const writes = transitionWrites(chips[0])

    await wrapper.setProps({ placeholder: "changed" })

    expect(writes).toEqual([])
    wrapper.unmount()
  })
})
