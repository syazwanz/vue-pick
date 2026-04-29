import type { OptionItem, OptionOrGroup } from "./index"
import { isOptionGroup } from "./index"

export interface FlatOption {
  id: string
  option: OptionItem
  depth: number
  hasChildren: boolean
  isExpanded: boolean
  parentValue?: OptionItem["value"]
  groupLabel?: string
  groupDisabled?: boolean
}

type ExpandedSet = ReadonlySet<OptionItem["value"]> | "all"

let _index = 0

function flattenRecursive(
  options: OptionOrGroup[],
  idPrefix: string,
  expandedSet: ExpandedSet,
  depth: number,
  parentValue: OptionItem["value"] | undefined,
  groupLabel: string | undefined,
  groupDisabled: boolean | undefined,
): FlatOption[] {
  const result: FlatOption[] = []

  for (const item of options) {
    if (isOptionGroup(item)) {
      const children = flattenRecursive(
        item.options,
        idPrefix,
        expandedSet,
        depth,
        parentValue,
        item.label,
        item.disabled,
      )
      result.push(...children)
      continue
    }

    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    const isExpanded =
      hasChildren && (expandedSet === "all" || expandedSet.has(item.value))

    result.push({
      id: `${idPrefix}-opt-${_index++}`,
      option: item,
      depth,
      hasChildren,
      isExpanded,
      parentValue,
      groupLabel,
      groupDisabled,
    })

    if (isExpanded && item.children) {
      const childRows = flattenRecursive(
        item.children,
        idPrefix,
        expandedSet,
        depth + 1,
        item.value,
        groupLabel,
        groupDisabled,
      )
      result.push(...childRows)
    }
  }

  return result
}

export function flattenOptions(
  options: OptionOrGroup[],
  idPrefix: string,
  expandedSet: ExpandedSet = new Set(),
): FlatOption[] {
  _index = 0
  return flattenRecursive(
    options,
    idPrefix,
    expandedSet,
    0,
    undefined,
    undefined,
    undefined,
  )
}
