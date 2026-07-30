import type { OptionItem, OptionGroup, OptionOrGroup } from "./index"

export interface OptionKeys {
  // An array is a fallback chain: the first key with a non-empty value wins.
  // Lets `{ label }` and `{ name }` shaped records share one config, which a
  // single key cannot express.
  label: string | string[]
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

function readLabel(obj: Record<string, unknown>, key: string | string[]) {
  if (!Array.isArray(key)) return obj[key] as string
  for (const candidate of key) {
    const v = obj[candidate]
    if (v !== undefined && v !== null && v !== "") return v as string
  }
  return undefined as unknown as string
}

function normalizeItem(item: unknown, k: OptionKeys): OptionOrGroup {
  const obj = (item ?? {}) as Record<string, unknown>
  const groupOptions = obj[k.groupOptions]
  if (Array.isArray(groupOptions)) {
    const group: OptionGroup = {
      label: readLabel(obj, k.label),
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
    label: readLabel(obj, k.label),
    value: obj[k.value],
  }
  // Non-enumerable so the normalized shape still deep-equals and serializes
  // like a plain option. Consumers can still read `option.raw`.
  Object.defineProperty(normalized, "raw", {
    value: item,
    enumerable: false,
    writable: false,
    configurable: true,
  })
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
