import type { OptionItem } from "./index"

type PartClass = string | undefined

// Per-option parts also take a function, so one row or chip can get its own
// class from the option it renders.
type OptionPartClass = string | ((option: OptionItem) => PartClass)

// Extra classes for each part, merged into the part's own class list at render
// so they survive re-renders and teleport.
export interface VPickClasses {
  trigger?: string
  input?: string
  chips?: string
  chip?: OptionPartClass
  chipLabel?: string
  chipRemove?: string
  clear?: string
  positioner?: string
  listbox?: string
  option?: OptionPartClass
  optionLabel?: string
  optionExpand?: string
  optionCheckbox?: string
  optionCheck?: string
}

export function resolvePartClass(
  value: OptionPartClass | undefined,
  option?: OptionItem,
): PartClass {
  if (typeof value === "function") return option ? value(option) : undefined
  return value
}
