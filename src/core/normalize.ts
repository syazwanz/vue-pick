import type { OptionItem, OptionGroup, OptionOrGroup } from "./index"

export interface OptionKeys {
  label: string
  value: string
  disabled: string
  children: string
  groupOptions: string
}

export const DEFAULT_KEYS: OptionKeys = {
  label: "label",
  value: "value",
  disabled: "disabled",
  children: "children",
  groupOptions: "options",
}

export function normalizeOptions(
  raw: readonly unknown[] | undefined | null,
  keys: Partial<OptionKeys> = {},
): OptionOrGroup[] {
  if (!raw) return []
  const k: OptionKeys = {
    label: keys.label ?? DEFAULT_KEYS.label,
    value: keys.value ?? DEFAULT_KEYS.value,
    disabled: keys.disabled ?? DEFAULT_KEYS.disabled,
    children: keys.children ?? DEFAULT_KEYS.children,
    groupOptions: keys.groupOptions ?? DEFAULT_KEYS.groupOptions,
  }
  return raw.map((item) => normalizeItem(item, k))
}

function normalizeItem(item: unknown, k: OptionKeys): OptionOrGroup {
  const obj = (item ?? {}) as Record<string, unknown>
  const groupOptions = obj[k.groupOptions]
  if (Array.isArray(groupOptions)) {
    const group: OptionGroup = {
      label: obj[k.label] as string,
      options: groupOptions.map((child) =>
        normalizeItem(child, k),
      ) as OptionItem[],
    }
    if (obj[k.disabled] !== undefined) {
      group.disabled = Boolean(obj[k.disabled])
    }
    return group
  }
  const normalized: OptionItem = {
    label: obj[k.label] as string,
    value: obj[k.value],
  }
  if (obj[k.disabled] !== undefined) {
    normalized.disabled = Boolean(obj[k.disabled])
  }
  const children = obj[k.children]
  if (Array.isArray(children)) {
    normalized.children = children.map((c) =>
      normalizeItem(c, k),
    ) as OptionItem[]
  }
  return normalized
}
