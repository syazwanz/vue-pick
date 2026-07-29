import type { OptionItem, OptionOrGroup } from "./index"
import { isOptionGroup } from "./index"

export interface FlatOption {
  id: string
  option: OptionItem
  depth: number
  // The author declared this a branch by passing a `children` array, even an
  // empty one. Drives the chevron, expansion, and `disableBranchNodes`.
  isBranch: boolean
  // The branch actually has rows underneath it. Drives cascade math, which is
  // meaningless for a branch with no descendants.
  hasChildren: boolean
  isExpanded: boolean
  // Placeholder row under an expanded branch whose `children` array is empty.
  // Inert: not selectable, not navigable.
  isEmptyMessage?: boolean
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

    const isBranch = Array.isArray(item.children)
    const hasChildren = isBranch && item.children!.length > 0
    const isExpanded =
      isBranch && (expandedSet === "all" || expandedSet.has(item.value))

    result.push({
      id: `${idPrefix}-opt-${_index++}`,
      option: item,
      depth,
      isBranch,
      hasChildren,
      isExpanded,
      parentValue,
      groupLabel,
      groupDisabled,
    })

    if (isExpanded && hasChildren) {
      const childRows = flattenRecursive(
        item.children!,
        idPrefix,
        expandedSet,
        depth + 1,
        item.value,
        groupLabel,
        groupDisabled,
      )
      result.push(...childRows)
    } else if (isExpanded) {
      // Expanded branch with an empty `children` array. Emit a placeholder row
      // so the dropdown can say so; it is inert and skipped by keyboard nav.
      result.push({
        id: `${idPrefix}-opt-${_index++}`,
        option: item,
        depth: depth + 1,
        isBranch: false,
        hasChildren: false,
        isExpanded: false,
        isEmptyMessage: true,
        parentValue: item.value,
        groupLabel,
        groupDisabled,
      })
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
