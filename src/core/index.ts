// Core — framework-agnostic logic
// Option normalization, filtering, keyboard nav, selection state

export interface OptionItem {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  disabled?: boolean
  // An array (even an empty one) marks this node as a branch. Omit the key
  // entirely for a leaf.
  children?: OptionItem[]
  // The caller's original object, kept so `select`/`deselect` can hand back
  // what was passed in rather than our converted shape.
  raw?: unknown
}

export interface OptionGroup {
  label: string
  disabled?: boolean
  options: OptionItem[]
}

export type OptionOrGroup = OptionItem | OptionGroup

export function isOptionGroup(item: OptionOrGroup): item is OptionGroup {
  return "options" in item && Array.isArray(item.options)
}

export { generateId, resetIdCounter } from "./id"
export { flattenOptions } from "./flatten"
export type { FlatOption } from "./flatten"
export { filterFlat, filterFlatWith } from "./filter"
export { normalizeOptions, DEFAULT_KEYS } from "./normalize"
export type { OptionKeys } from "./normalize"
export { computePosition } from "./positioning"
export type { PositionResult } from "./positioning"
export { lockBodyScroll, unlockBodyScroll } from "./bodyScrollLock"
export {
  setupScrollListeners,
  findScrollParent,
  scrollParents,
} from "./scrollListeners"
export { setupResizeObserver } from "./resizeObserver"
