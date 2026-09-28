export interface PositionResult {
  top: number
  left: number
  width: number
  placement: "top" | "bottom"
  availableHeight: number
}

export interface PositionBounds {
  top: number
  bottom: number
  left: number
  right: number
}

export interface PositionInput {
  triggerRect: Pick<DOMRect, "top" | "bottom" | "left" | "right" | "width">
  listboxHeight: number
  // The panel's own width once rendered. Before that, the trigger's width is the
  // best guess, since the panel is at least that wide.
  listboxWidth?: number
  // The space the panel may occupy, in the same coordinates as `triggerRect`:
  // the viewport, or the scroll container it is anchored inside.
  bounds: PositionBounds
  offset?: number
  margin?: number
  // Which edge of the trigger the panel lines up with. Physical edges: the
  // caller resolves `start`/`end` against the writing direction.
  align?: "left" | "right"
}

/**
 * Where the panel goes, in the same coordinate space as `triggerRect`.
 *
 * Vertically it opens below, or above when there is more room there, and its
 * height is clamped to what is left. Horizontally it lines up with one edge of
 * the trigger, then moves back inside the bounds if it would run past either
 * side, which is what keeps a wide panel on screen next to a trigger near an
 * edge.
 */
export function computePosition({
  triggerRect,
  listboxHeight,
  listboxWidth = triggerRect.width,
  bounds,
  offset = 4,
  margin = 8,
  align = "left",
}: PositionInput): PositionResult {
  const spaceBelow = bounds.bottom - triggerRect.bottom
  const spaceAbove = triggerRect.top - bounds.top
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
    (placement === "bottom" ? spaceBelow : spaceAbove) - offset - margin,
  )

  const width = Math.max(listboxWidth, triggerRect.width)
  let left = align === "right" ? triggerRect.right - width : triggerRect.left
  const maxLeft = bounds.right - margin - width
  if (left > maxLeft) left = maxLeft
  if (left < bounds.left + margin) left = bounds.left + margin

  return {
    top,
    left,
    width: triggerRect.width,
    placement,
    availableHeight,
  }
}

// The part of Floating UI that VPick hands positioning to: the coordinates, when
// to recompute them and when to hide. Declared here rather than imported, so
// VPick has no dependency on it: the caller passes in their own copy, as
// `import * as FloatingUI from "@floating-ui/dom"`.
//
// The arguments are typed `never` on purpose. Floating UI's own option and
// middleware types are richer than anything VPick could restate without
// importing them, and a narrower copy here would reject the real library.
// `never` accepts any version's signatures; what matters to VPick, the shape of
// the result, stays checked.
export interface FloatingUiLibrary {
  computePosition(
    reference: never,
    floating: never,
    options?: never,
  ): Promise<{
    x: number
    y: number
    placement: string
    strategy: "absolute" | "fixed"
    middlewareData?: { hide?: { referenceHidden?: boolean } }
  }>
  autoUpdate(
    reference: never,
    floating: never,
    update: () => void,
    options?: never,
  ): () => void
  offset(options?: never): unknown
  flip(options?: never): unknown
  shift(options?: never): unknown
  hide(options?: never): unknown
}
