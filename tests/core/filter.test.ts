import { describe, it, expect } from "vitest"
import { filterFlat, filterFlatWith } from "../../src/core/filter"
import { flattenOptions } from "../../src/core/flatten"
import type { OptionOrGroup } from "../../src/core"

const options: OptionOrGroup[] = [
  { label: "Apple", value: "a" },
  { label: "Banana", value: "b" },
  { label: "Cherry", value: "c" },
  { label: "apricot", value: "d" },
]

const grouped: OptionOrGroup[] = [
  {
    label: "Fruits",
    options: [
      { label: "Apple", value: "a" },
      { label: "Banana", value: "b" },
    ],
  },
  {
    label: "Colors",
    options: [
      { label: "Red", value: "r" },
      { label: "Blue", value: "b2" },
    ],
  },
]

describe("filterFlat", () => {
  it("returns all options for an empty query", () => {
    const flat = flattenOptions(options, "t")
    expect(filterFlat(flat, "")).toHaveLength(4)
  })

  it("returns all options for a whitespace-only query", () => {
    const flat = flattenOptions(options, "t")
    expect(filterFlat(flat, "   ")).toHaveLength(4)
  })

  it("filters case-insensitively", () => {
    const flat = flattenOptions(options, "t")
    const result = filterFlat(flat, "AP")
    expect(result.map((f) => f.option.label)).toEqual(["Apple", "apricot"])
  })

  it("matches substrings anywhere in the label", () => {
    const flat = flattenOptions(options, "t")
    const result = filterFlat(flat, "err")
    expect(result.map((f) => f.option.label)).toEqual(["Cherry"])
  })

  it("trims the query before matching", () => {
    const flat = flattenOptions(options, "t")
    expect(filterFlat(flat, "  ap  ").map((f) => f.option.label)).toEqual([
      "Apple",
      "apricot",
    ])
  })

  it("returns an empty array when no match", () => {
    const flat = flattenOptions(options, "t")
    expect(filterFlat(flat, "zzz")).toEqual([])
  })

  it("preserves groupLabel on matched options", () => {
    const flat = flattenOptions(grouped, "t")
    const result = filterFlat(flat, "apple")
    expect(result).toHaveLength(1)
    expect(result[0].groupLabel).toBe("Fruits")
  })
})

describe("filterFlatWith", () => {
  it("returns all options for empty query without calling predicate", () => {
    const flat = flattenOptions(options, "t")
    let called = false
    const result = filterFlatWith(flat, "", () => {
      called = true
      return false
    })
    expect(result).toHaveLength(4)
    expect(called).toBe(false)
  })

  it("uses the predicate to decide matches", () => {
    const flat = flattenOptions(options, "t")
    const result = filterFlatWith(flat, "x", (opt) => opt.value === "b")
    expect(result.map((f) => f.option.label)).toEqual(["Banana"])
  })

  it("passes the trimmed query to the predicate", () => {
    const flat = flattenOptions(options, "t")
    const seen: string[] = []
    filterFlatWith(flat, "  hello  ", (_opt, q) => {
      seen.push(q)
      return true
    })
    expect(new Set(seen)).toEqual(new Set(["hello"]))
  })

  it("allows matching on value or custom fields", () => {
    const flat = flattenOptions(options, "t")
    const result = filterFlatWith(flat, "a", (opt, q) =>
      String(opt.value).toLowerCase().includes(q.toLowerCase()),
    )
    expect(result.map((f) => f.option.value)).toEqual(["a"])
  })
})
