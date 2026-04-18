export interface PositionResult {
  top: number
  left: number
  width: number
  placement: "top" | "bottom"
  availableHeight: number
}

export function computePosition(
  triggerRect: DOMRect,
  listboxHeight: number,
  viewportHeight: number = typeof window !== "undefined"
    ? window.innerHeight
    : 0,
  offset = 4,
  viewportMargin = 8,
): PositionResult {
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const placement: "top" | "bottom" =
    spaceBelow < listboxHeight + offset && spaceAbove > spaceBelow
      ? "top"
      : "bottom"
  const top =
    placement === "bottom"
      ? triggerRect.bottom + offset
      : triggerRect.top - listboxHeight - offset
  const availableHeight = Math.max(
    0,
    (placement === "bottom" ? spaceBelow : spaceAbove) - offset - viewportMargin,
  )
  return {
    top,
    left: triggerRect.left,
    width: triggerRect.width,
    placement,
    availableHeight,
  }
}
