export interface PositionResult {
  top: number
  left: number
  width: number
  placement: "top" | "bottom"
  availableHeight: number
}

/**
 * Where the panel goes, in the same coordinate space as `triggerRect`.
 *
 * `boundsTop`/`boundsBottom` delimit the space the panel may occupy, and drive
 * both flipping and height clamping. They default to the viewport. When the
 * panel is anchored inside a scroll container, pass that container's edges so
 * the panel is sized to fit the container rather than the window.
 */
export function computePosition(
  triggerRect: DOMRect,
  listboxHeight: number,
  viewportHeight: number = typeof window !== "undefined"
    ? window.innerHeight
    : 0,
  offset = 4,
  viewportMargin = 8,
  boundsTop = 0,
  boundsBottom = viewportHeight,
): PositionResult {
  const spaceBelow = boundsBottom - triggerRect.bottom
  const spaceAbove = triggerRect.top - boundsTop
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
    (placement === "bottom" ? spaceBelow : spaceAbove) -
      offset -
      viewportMargin,
  )
  return {
    top,
    left: triggerRect.left,
    width: triggerRect.width,
    placement,
    availableHeight,
  }
}
