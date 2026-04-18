import { describe, it, expect } from "vitest"
import { normalizeOptions } from "../../src/core/normalize"
import { isOptionGroup } from "../../src/core"

describe("normalizeOptions", () => {
  it("returns empty array for null/undefined input", () => {
    expect(normalizeOptions(null)).toEqual([])
    expect(normalizeOptions(undefined)).toEqual([])
  })

  it("passes default-shaped data through unchanged", () => {
    const raw = [
      { label: "A", value: "a" },
      { label: "B", value: "b", disabled: true },
    ]
    const result = normalizeOptions(raw)
    expect(result).toEqual([
      { label: "A", value: "a" },
      { label: "B", value: "b", disabled: true },
    ])
  })

  it("remaps label and value keys", () => {
    const raw = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]
    const result = normalizeOptions(raw, { label: "name", value: "id" })
    expect(result).toEqual([
      { label: "Alice", value: 1 },
      { label: "Bob", value: 2 },
    ])
  })

  it("remaps disabled key", () => {
    const raw = [
      { label: "A", value: "a", inactive: true },
      { label: "B", value: "b", inactive: false },
    ]
    const result = normalizeOptions(raw, { disabled: "inactive" })
    expect(result[0]).toEqual({ label: "A", value: "a", disabled: true })
    expect(result[1]).toEqual({ label: "B", value: "b", disabled: false })
  })

  it("coerces disabled values to boolean", () => {
    const raw = [{ label: "A", value: "a", disabled: 1 }]
    const result = normalizeOptions(raw)
    expect(result[0]).toMatchObject({ disabled: true })
  })

  it("omits disabled when key is absent", () => {
    const raw = [{ label: "A", value: "a" }]
    const result = normalizeOptions(raw)
    expect(result[0]).not.toHaveProperty("disabled")
  })

  it("detects groups via groupOptionsKey", () => {
    const raw = [
      {
        name: "Americas",
        members: [
          { id: "us", name: "United States" },
          { id: "ca", name: "Canada" },
        ],
      },
    ]
    const result = normalizeOptions(raw, {
      label: "name",
      value: "id",
      groupOptions: "members",
    })
    expect(result).toHaveLength(1)
    const first = result[0]
    expect(isOptionGroup(first)).toBe(true)
    if (isOptionGroup(first)) {
      expect(first.label).toBe("Americas")
      expect(first.options).toEqual([
        { label: "United States", value: "us" },
        { label: "Canada", value: "ca" },
      ])
    }
  })

  it("handles mixed flat and group items", () => {
    const raw = [
      { name: "Loose", id: "l" },
      { name: "Group", members: [{ name: "Inner", id: "i" }] },
    ]
    const result = normalizeOptions(raw, {
      label: "name",
      value: "id",
      groupOptions: "members",
    })
    expect(isOptionGroup(result[0])).toBe(false)
    expect(isOptionGroup(result[1])).toBe(true)
  })

  it("normalizes tree via childrenKey recursively", () => {
    const raw = [
      {
        code: "food",
        title: "Food",
        subs: [{ code: "fruit", title: "Fruit" }],
      },
    ]
    const result = normalizeOptions(raw, {
      label: "title",
      value: "code",
      children: "subs",
    })
    expect(result[0]).toMatchObject({
      label: "Food",
      value: "food",
      children: [{ label: "Fruit", value: "fruit" }],
    })
  })

  it("treats missing keys as undefined", () => {
    const raw = [{ foo: 1 }]
    const result = normalizeOptions(raw)
    expect(result[0]).toEqual({ label: undefined, value: undefined })
  })

  it("ignores undefined values in keys override (partial spread doesn't wipe defaults)", () => {
    const raw = [{ label: "A", value: "a" }]
    const result = normalizeOptions(raw, {
      label: undefined,
      value: undefined,
    })
    expect(result[0]).toMatchObject({ label: "A", value: "a" })
  })

  it("propagates group disabled flag", () => {
    const raw = [
      {
        label: "G",
        options: [{ label: "I", value: "i" }],
        disabled: true,
      },
    ]
    const result = normalizeOptions(raw)
    const first = result[0]
    expect(isOptionGroup(first)).toBe(true)
    if (isOptionGroup(first)) {
      expect(first.disabled).toBe(true)
    }
  })
})
