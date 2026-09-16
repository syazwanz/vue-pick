import { describe, it, expect } from "vitest"
import { VPick, VPickNative } from "../src/vue3"
import {
  props as allProps,
  vpickProps,
  vpickNativeProps,
} from "../docs/.vitepress/data/props"

/**
 * Asserts the docs prop list against the components both ways: a prop added
 * fails until documented, a prop removed fails until its entry goes.
 *
 * Vue 2 is not covered. The adapters are kept in sync by their own tests.
 */

function runtimePropNames(component: unknown): string[] {
  const props = (component as { props?: Record<string, unknown> }).props
  return Object.keys(props ?? {}).sort()
}

describe("documented props match the components", () => {
  const cases = [
    { name: "VPick", component: VPick, documented: vpickProps },
    {
      name: "VPickNative",
      component: VPickNative,
      documented: vpickNativeProps,
    },
  ]

  for (const { name, component, documented } of cases) {
    describe(name, () => {
      const runtime = runtimePropNames(component)
      const listed = new Set(documented.map((p) => p.name))

      // Without this, an empty runtime list passes both assertions below.
      it("reads its props off the compiled component", () => {
        expect(runtime.length).toBeGreaterThan(0)
      })

      it("documents every prop it accepts", () => {
        expect(runtime.filter((prop) => !listed.has(prop))).toEqual([])
      })

      it("documents no prop it no longer accepts", () => {
        const accepted = new Set(runtime)
        expect([...listed].filter((prop) => !accepted.has(prop))).toEqual([])
      })
    })
  }
})

describe("prop entries are well formed", () => {
  // Shared props are one entry carrying both names, so a duplicate is a slip.
  it("has no duplicate names", () => {
    const seen = new Set<string>()
    const duplicates = allProps
      .map((p) => p.name)
      .filter((name) => {
        if (seen.has(name)) return true
        seen.add(name)
        return false
      })
    expect(duplicates).toEqual([])
  })

  it("fills in every field", () => {
    for (const prop of allProps) {
      expect(prop.name, prop.name).toBeTruthy()
      expect(prop.type, prop.name).toBeTruthy()
      expect(prop.default, prop.name).toBeTruthy()
      expect(prop.description, prop.name).toBeTruthy()
      expect(prop.components.length, prop.name).toBeGreaterThan(0)
    }
  })
})
