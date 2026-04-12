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
