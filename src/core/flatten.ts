import type { OptionItem, OptionOrGroup } from "./index"
import { isOptionGroup } from "./index"

export interface FlatOption {
  id: string
  option: OptionItem
  depth: number
  groupLabel?: string
  groupDisabled?: boolean
}

export function flattenOptions(
  options: OptionOrGroup[],
  idPrefix: string,
): FlatOption[] {
  const result: FlatOption[] = []
  let index = 0

  for (const item of options) {
    if (isOptionGroup(item)) {
      for (const option of item.options) {
        result.push({
          id: `${idPrefix}-opt-${index++}`,
          option,
          depth: 0,
          groupLabel: item.label,
          groupDisabled: item.disabled,
        })
      }
    } else {
      result.push({
        id: `${idPrefix}-opt-${index++}`,
        option: item,
        depth: 0,
      })
    }
  }

  return result
}
