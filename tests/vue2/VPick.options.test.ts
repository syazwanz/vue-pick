import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick, reactive } from "vue"
import { VPick } from "../../src/vue2"

type Node = { label: string; value: string; children?: Node[] | null }

const leaves = (prefix: string, n: number): Node[] =>
  Array.from({ length: n }, (_, i) => ({
    label: `${prefix} leaf ${i}`,
    value: `${prefix}-l${i}`,
  }))

// One root, 29 branches, only the first loaded: 688 rows once it is open.
const partial = (): Node[] => [
  {
    label: "Root",
    value: "root",
    children: Array.from({ length: 29 }, (_, i) =>
      i === 0
        ? { label: "Big", value: "s0", children: leaves("s0", 658) }
        : { label: `Branch ${i}`, value: `s${i}`, children: null },
    ),
  },
]

// Everything loaded: 29 branches of 115 leaves.
const full = (): Node[] => [
  {
    label: "Root",
    value: "root",
    children: Array.from({ length: 29 }, (_, i) => ({
      label: `Branch ${i}`,
      value: `s${i}`,
      children: leaves(`s${i}`, 115),
    })),
  },
]

function deepFreeze<T>(o: T): T {
  if (o && typeof o === "object") {
    Object.values(o as object).forEach(deepFreeze)
    Object.freeze(o)
  }
  return o
}

const loadChildren = (option: unknown) =>
  Promise.resolve(leaves((option as Node).value, 115))

function mountTree(
  options: readonly unknown[],
  props: Record<string, unknown> = {},
) {
  return mount(VPick, {
    propsData: {
      multiple: true,
      value: [],
      options,
      loadChildren,
      defaultExpandLevel: 1,
      ...props,
    },
    attachTo: document.body,
  })
}
type Wrapper = ReturnType<typeof mountTree>

const rows = (wrapper: Wrapper) => wrapper.findAll('[role="option"]').wrappers
const labels = (wrapper: Wrapper) =>
  rows(wrapper).map((r) => r.find(".vpick-option-label").text())
function row(wrapper: Wrapper, label: string) {
  const found = rows(wrapper).find(
    (r) => r.find(".vpick-option-label").text() === label,
  )
  if (!found) throw new Error(`No row labelled ${label}`)
  return found
}

async function openList(wrapper: Wrapper) {
  await wrapper.find('[role="combobox"]').trigger("click")
  await nextTick()
}

function lastEmitted(wrapper: Wrapper) {
  const all = wrapper.emitted("input")
  return (all?.[all.length - 1]?.[0] ?? []) as unknown[]
}

async function flush() {
  await new Promise((r) => setTimeout(r))
  await nextTick()
}

describe("VPick (Vue 2) — options edited in place", () => {
  it("shows an option pushed into the array", async () => {
    const options = reactive([{ label: "One", value: "one" }])
    const wrapper = mountTree(options, { multiple: false, value: null })
    await openList(wrapper)
    options.push({ label: "Two", value: "two" })
    await nextTick()
    expect(labels(wrapper)).toEqual(["One", "Two"])
    wrapper.destroy()
  })

  it("shows a label changed on an option", async () => {
    const options = reactive([{ label: "One", value: "one" }])
    const wrapper = mountTree(options, { multiple: false, value: null })
    await openList(wrapper)
    options[0].label = "Uno"
    await nextTick()
    expect(labels(wrapper)).toEqual(["Uno"])
    wrapper.destroy()
  })

  it("shows children assigned to a nested branch", async () => {
    const options = reactive<Node[]>([
      {
        label: "Root",
        value: "root",
        children: [{ label: "Branch", value: "branch", children: [] }],
      },
    ])
    const wrapper = mountTree(options, { defaultExpandLevel: 2 })
    await openList(wrapper)
    options[0].children![0].children = [{ label: "Leaf", value: "leaf" }]
    await nextTick()
    expect(labels(wrapper)).toEqual(["Root", "Branch", "Leaf"])
    wrapper.destroy()
  })
})

// Options from component data are reactive, and VPick must not get slower
// because of it. Each case is timed against the same tree frozen, which Vue
// cannot track at all, so the bound holds on any machine. Before the tree was
// built in a watcher, Vue 2 took 10 to 60 times longer here with reactive
// options; both builds share the test so neither can drift.
describe("VPick (Vue 2) — large trees with reactive options", () => {
  const REPS = 3
  const median = (a: number[]) => [...a].sort((x, y) => x - y)[a.length >> 1]
  async function timed(fn: () => Promise<void>) {
    const start = performance.now()
    await fn()
    return performance.now() - start
  }

  // Opens the list, then the loaded branch by its chevron: 688 rows and no
  // requests, since the other branches stay closed.
  async function open688(wrapper: Wrapper) {
    await openList(wrapper)
    await row(wrapper, "Big").find(".vpick-option-expand").trigger("click")
    await nextTick()
    expect(rows(wrapper)).toHaveLength(688)
  }

  type Times = {
    tick: number
    keystroke: number
    selectAll: number
    open: number
  }

  async function measure(
    prep: (o: Node[]) => readonly unknown[],
  ): Promise<Times> {
    const tick: number[] = []
    const keystroke: number[] = []
    const selectAll: number[] = []
    const open: number[] = []
    for (let i = 0; i < REPS; i++) {
      const wrapper = mountTree(prep(partial()), { searchable: true })
      await open688(wrapper)

      const leaf = row(wrapper, "s0 leaf 5")
      tick.push(
        await timed(async () => {
          await leaf.trigger("click")
          await wrapper.setProps({ value: lastEmitted(wrapper) })
          await nextTick()
        }),
      )
      expect(lastEmitted(wrapper)).toEqual(["s0-l5"])

      const input = wrapper.find("input")
      keystroke.push(
        await timed(async () => {
          await input.setValue("e")
          await nextTick()
        }),
      )
      await input.setValue("")
      await nextTick()

      const chevron = row(wrapper, "Branch 3").find(".vpick-option-expand")
      open.push(
        await timed(async () => {
          await chevron.trigger("click")
          await flush()
          await flush()
        }),
      )
      expect(labels(wrapper)).toContain("s3 leaf 0")
      wrapper.destroy()

      const all = mountTree(prep(full()), {
        valueConsistsOf: "ALL_WITH_INDETERMINATE",
      })
      await openList(all)
      const root = row(all, "Root")
      selectAll.push(
        await timed(async () => {
          await root.trigger("click")
          await all.setProps({ value: lastEmitted(all) })
          await nextTick()
        }),
      )
      expect(lastEmitted(all).length).toBeGreaterThan(3000)
      all.destroy()
    }
    return {
      tick: median(tick),
      keystroke: median(keystroke),
      selectAll: median(selectAll),
      open: median(open),
    }
  }

  it("cost no more than the same tree frozen", async () => {
    const frozen = await measure((o) => deepFreeze(o))
    const live = await measure((o) => reactive(o))
    // A small floor absorbs timer noise on a tiny measurement.
    const bound = (ms: number) => ms * 3 + 25
    expect(live.tick, "ticking one leaf").toBeLessThan(bound(frozen.tick))
    expect(live.keystroke, "one keystroke").toBeLessThan(
      bound(frozen.keystroke),
    )
    expect(live.selectAll, "select all").toBeLessThan(bound(frozen.selectAll))
    expect(live.open, "opening a branch").toBeLessThan(bound(frozen.open))
  }, 120000)
})
