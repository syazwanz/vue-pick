import type { OptionItem } from "./index"
import type { FlatOption } from "./flatten"

export function filterFlat(options: FlatOption[], query: string): FlatOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return options
  return options.filter((f) => f.option.label.toLowerCase().includes(q))
}

export function filterFlatWith(
  options: FlatOption[],
  query: string,
  predicate: (option: OptionItem, query: string) => boolean,
): FlatOption[] {
  const q = query.trim()
  if (!q) return options
  return options.filter((f) => predicate(f.option, q))
}
