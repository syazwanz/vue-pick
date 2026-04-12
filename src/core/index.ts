// Core — framework-agnostic logic
// Option normalization, filtering, keyboard nav, selection state

export interface OptionItem {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  disabled?: boolean
  children?: OptionItem[]
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
export { filterFlat } from "./filter"
