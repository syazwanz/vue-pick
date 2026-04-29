import { describe, it, expect } from "vitest"
import { flattenOptions } from "../../src/core/flatten"
import type { OptionOrGroup } from "../../src/core"

const flat: OptionOrGroup[] = [
  { label: "A", value: "a" },
  { label: "B", value: "b" },
  { label: "C", value: "c", disabled: true },
]

const grouped: OptionOrGroup[] = [
  {
    label: "Group 1",
    options: [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
    ],
  },
  {
    label: "Group 2",
    disabled: true,
    options: [{ label: "C", value: "c" }],
  },
]

const tree: OptionOrGroup[] = [
  {
    label: "Parent 1",
    value: "p1",
    children: [
      { label: "Child 1.1", value: "c11" },
      { label: "Child 1.2", value: "c12" },
    ],
  },
  { label: "Leaf", value: "leaf" },
  {
    label: "Parent 2",
    value: "p2",
    children: [
      {
        label: "Child 2.1",
        value: "c21",
        children: [{ label: "Grandchild", value: "gc" }],
      },
    ],
  },
]

describe("flattenOptions", () => {
  it("flattens flat options", () => {
    const result = flattenOptions(flat, "test")
    expect(result).toHaveLength(3)
    expect(result[0].option.label).toBe("A")
    expect(result[1].option.label).toBe("B")
    expect(result[2].option.label).toBe("C")
  })

  it("assigns unique IDs", () => {
    const result = flattenOptions(flat, "test")
    const ids = result.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("sets depth to 0 for flat options", () => {
    const result = flattenOptions(flat, "test")
    expect(result.every((r) => r.depth === 0)).toBe(true)
  })

  it("sets hasChildren=false and isExpanded=false for flat options", () => {
    const result = flattenOptions(flat, "test")
    expect(result.every((r) => r.hasChildren === false)).toBe(true)
    expect(result.every((r) => r.isExpanded === false)).toBe(true)
  })

  it("flattens grouped options with groupLabel", () => {
    const result = flattenOptions(grouped, "test")
    expect(result).toHaveLength(3)
    expect(result[0].groupLabel).toBe("Group 1")
    expect(result[1].groupLabel).toBe("Group 1")
    expect(result[2].groupLabel).toBe("Group 2")
  })

  it("propagates groupDisabled", () => {
    const result = flattenOptions(grouped, "test")
    expect(result[0].groupDisabled).toBeUndefined()
    expect(result[2].groupDisabled).toBe(true)
  })

  it("preserves disabled on individual options", () => {
    const result = flattenOptions(flat, "test")
    expect(result[2].option.disabled).toBe(true)
  })

  it("returns empty array for empty input", () => {
    expect(flattenOptions([], "test")).toEqual([])
  })

  it("handles mixed flat and grouped options", () => {
    const mixed: OptionOrGroup[] = [
      { label: "Standalone", value: "s" },
      {
        label: "Group",
        options: [{ label: "Nested", value: "n" }],
      },
    ]
    const result = flattenOptions(mixed, "test")
    expect(result).toHaveLength(2)
    expect(result[0].groupLabel).toBeUndefined()
    expect(result[1].groupLabel).toBe("Group")
  })
})

describe("flattenOptions — tree", () => {
  it("hides children of collapsed branch (default empty expandedSet)", () => {
    const result = flattenOptions(tree, "test")
    expect(result).toHaveLength(3)
    expect(result.map((r) => r.option.value)).toEqual(["p1", "leaf", "p2"])
  })

  it("sets hasChildren=true for branch nodes", () => {
    const result = flattenOptions(tree, "test")
    expect(result[0].hasChildren).toBe(true)
    expect(result[1].hasChildren).toBe(false)
    expect(result[2].hasChildren).toBe(true)
  })

  it("sets isExpanded=false for collapsed branches", () => {
    const result = flattenOptions(tree, "test")
    expect(result[0].isExpanded).toBe(false)
    expect(result[2].isExpanded).toBe(false)
  })

  it("expands branch when its value is in expandedSet", () => {
    const result = flattenOptions(tree, "test", new Set(["p1"]))
    expect(result).toHaveLength(5)
    expect(result.map((r) => r.option.value)).toEqual([
      "p1",
      "c11",
      "c12",
      "leaf",
      "p2",
    ])
  })

  it("sets isExpanded=true for expanded branch", () => {
    const result = flattenOptions(tree, "test", new Set(["p1"]))
    expect(result[0].isExpanded).toBe(true)
  })

  it("sets correct depth for children", () => {
    const result = flattenOptions(tree, "test", new Set(["p1"]))
    expect(result[0].depth).toBe(0)
    expect(result[1].depth).toBe(1)
    expect(result[2].depth).toBe(1)
    expect(result[3].depth).toBe(0)
  })

  it("sets parentValue on child nodes", () => {
    const result = flattenOptions(tree, "test", new Set(["p1"]))
    expect(result[0].parentValue).toBeUndefined()
    expect(result[1].parentValue).toBe("p1")
    expect(result[2].parentValue).toBe("p1")
    expect(result[3].parentValue).toBeUndefined()
  })

  it("expands nested branches when both are in expandedSet", () => {
    const result = flattenOptions(tree, "test", new Set(["p2", "c21"]))
    expect(result.map((r) => r.option.value)).toEqual([
      "p1",
      "leaf",
      "p2",
      "c21",
      "gc",
    ])
    expect(result[3].depth).toBe(1)
    expect(result[4].depth).toBe(2)
    expect(result[4].parentValue).toBe("c21")
  })

  it("does not expand nested branch if parent not expanded", () => {
    const result = flattenOptions(tree, "test", new Set(["c21"]))
    expect(result.map((r) => r.option.value)).toEqual(["p1", "leaf", "p2"])
  })

  it("D10: empty children array renders as leaf (no hasChildren)", () => {
    const withEmpty: OptionOrGroup[] = [
      { label: "Empty branch", value: "eb", children: [] },
      { label: "Leaf", value: "lf" },
    ]
    const result = flattenOptions(withEmpty, "test")
    expect(result[0].hasChildren).toBe(false)
    expect(result[0].isExpanded).toBe(false)
  })

  it("'all' sentinel expands entire tree", () => {
    const result = flattenOptions(tree, "test", "all")
    expect(result.map((r) => r.option.value)).toEqual([
      "p1",
      "c11",
      "c12",
      "leaf",
      "p2",
      "c21",
      "gc",
    ])
  })

  it("'all' sentinel sets correct depths", () => {
    const result = flattenOptions(tree, "test", "all")
    const depths = result.map((r) => r.depth)
    expect(depths).toEqual([0, 1, 1, 0, 0, 1, 2])
  })
})
