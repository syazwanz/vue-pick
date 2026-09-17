import { describe, it, expect } from "vitest"
import {
  filterFlat,
  filterFlatWith,
  foldForSearch,
  optionMatches,
} from "../../src/core/filter"
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

  it("ignores accents on either side", () => {
    const flat = flattenOptions(
      [
        { label: "Café", value: "cafe" },
        { label: "Muller", value: "muller" },
        { label: "Tea", value: "tea" },
      ],
      "t",
    )
    expect(filterFlat(flat, "cafe").map((f) => f.option.value)).toEqual([
      "cafe",
    ])
    expect(filterFlat(flat, "MÜLLER").map((f) => f.option.value)).toEqual([
      "muller",
    ])
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

describe("foldForSearch", () => {
  it("lowercases and strips Latin accents", () => {
    expect(foldForSearch("Crème Brûlée")).toBe("creme brulee")
    expect(foldForSearch("São Paulo")).toBe("sao paulo")
  })

  it("leaves letters with no decomposition as they are", () => {
    expect(foldForSearch("Øresund Łódź Straße")).toBe("øresund łodz straße")
  })

  it("keeps vowel signs in scripts where they change the word", () => {
    expect(foldForSearch("कि")).not.toBe(foldForSearch("क"))
  })
})

describe("optionMatches", () => {
  const option = (raw: Record<string, unknown>) => {
    const o = { label: String(raw.name), value: raw.id } as {
      label: string
      value: unknown
      raw?: unknown
    }
    Object.defineProperty(o, "raw", { value: raw, enumerable: false })
    return o as Parameters<typeof optionMatches>[0]
  }
  const ada = option({
    id: 1,
    name: "Ada Lovelace",
    email: "ada@example.com",
    code: 1815,
    tags: ["Mathématique", "engine"],
  })

  it("matches the label with or without extra keys", () => {
    expect(optionMatches(ada, "lovelace")).toBe(true)
    expect(optionMatches(ada, "lovelace", ["email"])).toBe(true)
  })

  it("matches a string, number or array field named in searchKeys", () => {
    expect(optionMatches(ada, "example.com")).toBe(false)
    expect(optionMatches(ada, "example.com", ["email"])).toBe(true)
    expect(optionMatches(ada, "181", "code")).toBe(true)
    expect(optionMatches(ada, "engine", ["tags"])).toBe(true)
  })

  it("ignores accents in fields too", () => {
    expect(optionMatches(ada, "mathematique", ["tags"])).toBe(true)
  })

  it("skips missing fields and values that are not text or numbers", () => {
    const odd = option({ id: 2, name: "Odd", meta: { note: "hidden" } })
    expect(optionMatches(odd, "hidden", ["meta", "nope"])).toBe(false)
  })
})
