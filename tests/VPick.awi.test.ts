import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick } from "vue"
import VPick from "../src/vue3/VPick.vue"
import type { OptionOrGroup } from "../src/core"

const tree: OptionOrGroup[] = [
  {
    label: "Electronics",
    value: "electronics",
    children: [
      { label: "Phones", value: "phones" },
      { label: "Laptops", value: "laptops" },
      { label: "Tablets", value: "tablets" },
    ],
  },
]

type Mode =
  | "ALL"
  | "BRANCH_PRIORITY"
  | "ALL_WITH_INDETERMINATE"
  | "LEAF_PRIORITY"

function open(mode: Mode, modelValue: unknown[] = []) {
  return mount(VPick, {
    props: {
      options: tree,
      multiple: true,
      valueConsistsOf: mode,
      modelValue,
      defaultExpandLevel: 1,
    },
  })
}

async function tick(wrapper: ReturnType<typeof open>, label: string) {
  await wrapper.find('[role="combobox"]').trigger("click")
  await nextTick()
  const row = wrapper
    .findAll('[role="option"]')
    .find((r) => r.text().includes(label))!
  await row.trigger("click")
  const emitted = wrapper.emitted("update:modelValue")!
  return emitted[emitted.length - 1][0] as unknown[]
}

function selectedLabels(wrapper: ReturnType<typeof open>) {
  return wrapper
    .findAll('[role="option"]')
    .filter((r) => r.attributes("aria-selected") === "true")
    .map((r) => r.text().trim())
}

describe("VPick — ALL_WITH_INDETERMINATE round trip", () => {
  // Emit includes a parent as soon as *some* descendant is selected. Reading
  // that back as "the whole branch" is what made the mode unusable: the render
  // disagreed with the model from the first click.
  it("ticking one leaf leaves its siblings unticked", async () => {
    const wrapper = open("ALL_WITH_INDETERMINATE")
    const value = await tick(wrapper, "Phones")
    expect(value).toEqual(["electronics", "phones"])

    await wrapper.setProps({ modelValue: value })
    await nextTick()
    expect(selectedLabels(wrapper)).not.toContain("Laptops")
    expect(selectedLabels(wrapper)).not.toContain("Tablets")
  })

  it("the parent renders indeterminate, not checked", async () => {
    const wrapper = open("ALL_WITH_INDETERMINATE", ["electronics", "phones"])
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const box = wrapper
      .findAll('[role="option"]')
      .find((r) => r.text().includes("Electronics"))!
      .find(".vpick-option-checkbox")
    expect(box.classes()).toContain("vpick-option-checkbox--indeterminate")
    expect(box.classes()).not.toContain("vpick-option-checkbox--checked")
  })

  it("ticking every leaf renders the parent checked", async () => {
    const wrapper = open("ALL_WITH_INDETERMINATE", [
      "electronics",
      "phones",
      "laptops",
      "tablets",
    ])
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    const box = wrapper
      .findAll('[role="option"]')
      .find((r) => r.text().includes("Electronics"))!
      .find(".vpick-option-checkbox")
    expect(box.classes()).toContain("vpick-option-checkbox--checked")
    expect(box.classes()).not.toContain("vpick-option-checkbox--indeterminate")
  })

  // The general guard: whatever a mode emits has to render the same way when
  // it is handed straight back, which is all a v-model consumer ever does.
  it.each<Mode>([
    "LEAF_PRIORITY",
    "ALL",
    "BRANCH_PRIORITY",
    "ALL_WITH_INDETERMINATE",
  ])("%s round-trips one leaf without gaining others", async (mode) => {
    const first = open(mode)
    const value = await tick(first, "Phones")

    const second = open(mode, value)
    await second.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(selectedLabels(second)).toContain("Phones")
    expect(selectedLabels(second)).not.toContain("Laptops")
    expect(selectedLabels(second)).not.toContain("Tablets")
  })

  it("ALL still expands a fully-selected branch back to its leaves", async () => {
    const wrapper = open("ALL", ["electronics", "phones", "laptops", "tablets"])
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(selectedLabels(wrapper)).toContain("Laptops")
  })

  it("BRANCH_PRIORITY still expands a branch value to its leaves", async () => {
    const wrapper = open("BRANCH_PRIORITY", ["electronics"])
    await wrapper.find('[role="combobox"]').trigger("click")
    await nextTick()
    expect(selectedLabels(wrapper)).toContain("Laptops")
  })
})
