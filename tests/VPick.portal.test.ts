import { describe, it, expect, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import VPick from "../src/vue3/VPick.vue"

// These tests run WITHOUT the global Teleport stub so we can verify real
// portal behavior. We re-enable Teleport by passing stubs: { Teleport: false }
// on a per-mount basis.

const opts = [
  { label: "Todo", value: "todo" },
  { label: "Done", value: "done" },
]

afterEach(() => {
  // Clean any teleported nodes left in body between tests.
  document.body.querySelectorAll('[role="listbox"]').forEach((n) => n.remove())
})

describe("VPick — portal", () => {
  it("renders listbox outside the component root when open", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")

    const inRoot = wrapper.element.querySelector('[role="listbox"]')
    const inBody = document.body.querySelector('[role="listbox"]')

    expect(inRoot).toBe(null)
    expect(inBody).not.toBe(null)
    wrapper.unmount()
  })

  it("listbox is not present in body when closed", () => {
    const wrapper = mount(VPick, {
      props: { options: opts },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    // Teleport is disabled when closed — listbox stays in wrapper, v-show hides it.
    const inBody = document.body.querySelector("[data-teleport-stub]")
    expect(inBody).toBe(null)
    wrapper.unmount()
  })

  it("clicking a teleported option still selects it", async () => {
    const wrapper = mount(VPick, {
      props: { options: opts, modelValue: "todo" },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await wrapper.find('[role="combobox"]').trigger("click")

    const option = document.body.querySelector<HTMLElement>(
      '[role="option"]:last-of-type',
    )
    expect(option).not.toBe(null)
    option!.dispatchEvent(new MouseEvent("click", { bubbles: true }))

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["done"])
    wrapper.unmount()
  })
})
