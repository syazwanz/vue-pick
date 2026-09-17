import { describe, it, expect } from "vitest"
import { computePosition } from "../../src/core/positioning"

const viewport = { top: 0, bottom: 800, left: 0, right: 1000 }

function trigger(left: number, top: number, width = 100, height = 32) {
  return { left, right: left + width, top, bottom: top + height, width }
}

describe("computePosition: vertical", () => {
  it("opens below with the offset", () => {
    const r = computePosition({
      triggerRect: trigger(100, 100),
      listboxHeight: 200,
      bounds: viewport,
    })
    expect(r.placement).toBe("bottom")
    expect(r.top).toBe(136)
  })

  it("flips above when there is more room there", () => {
    const r = computePosition({
      triggerRect: trigger(100, 700),
      listboxHeight: 200,
      bounds: viewport,
    })
    expect(r.placement).toBe("top")
    expect(r.top).toBe(700 - 200 - 4)
  })
})

describe("computePosition: horizontal", () => {
  it("lines up with the trigger's left edge by default", () => {
    const r = computePosition({
      triggerRect: trigger(100, 100),
      listboxHeight: 100,
      listboxWidth: 300,
      bounds: viewport,
    })
    expect(r.left).toBe(100)
  })

  it("lines up with the trigger's right edge when asked", () => {
    const r = computePosition({
      triggerRect: trigger(400, 100),
      listboxHeight: 100,
      listboxWidth: 300,
      bounds: viewport,
      align: "right",
    })
    expect(r.left).toBe(500 - 300)
  })

  it("moves a wide panel back inside the right edge", () => {
    const r = computePosition({
      triggerRect: trigger(900, 100),
      listboxHeight: 100,
      listboxWidth: 400,
      bounds: viewport,
    })
    expect(r.left).toBe(1000 - 8 - 400)
  })

  it("moves a right-aligned panel back inside the left edge", () => {
    const r = computePosition({
      triggerRect: trigger(0, 100),
      listboxHeight: 100,
      listboxWidth: 400,
      bounds: viewport,
      align: "right",
    })
    expect(r.left).toBe(8)
  })

  it("keeps the panel inside the container it is anchored in", () => {
    const container = { top: 0, bottom: 800, left: 200, right: 600 }
    const r = computePosition({
      triggerRect: trigger(500, 100),
      listboxHeight: 100,
      listboxWidth: 250,
      bounds: container,
    })
    expect(r.left).toBe(600 - 8 - 250)
  })

  it("never uses less than the trigger's width", () => {
    const r = computePosition({
      triggerRect: trigger(895, 100, 100),
      listboxHeight: 100,
      listboxWidth: 50,
      bounds: viewport,
    })
    expect(r.left).toBe(1000 - 8 - 100)
  })
})
