import { describe, it, expect } from "vitest"
import { isOptionGroup } from "../src/core"
import type { OptionItem, OptionGroup } from "../src/core"

describe("isOptionGroup", () => {
  it("returns true for an option group", () => {
    const group: OptionGroup = {
      label: "Group",
      options: [{ label: "A", value: "a" }],
    }
    expect(isOptionGroup(group)).toBe(true)
  })

  it("returns false for a flat option", () => {
    const option: OptionItem = { label: "A", value: "a" }
    expect(isOptionGroup(option)).toBe(false)
  })

  it("returns false for an option with children but no options array", () => {
    const option: OptionItem = {
      label: "A",
      value: "a",
      children: [{ label: "B", value: "b" }],
    }
    expect(isOptionGroup(option)).toBe(false)
  })

  it("returns true even if options array is empty", () => {
    const group: OptionGroup = { label: "Empty", options: [] }
    expect(isOptionGroup(group)).toBe(true)
  })
})
