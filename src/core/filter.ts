import type { FlatOption } from "./flatten"

export function filterFlat(
  options: FlatOption[],
  query: string,
): FlatOption[] {
  if (!query) return options
  const q = query.toLowerCase()
  return options.filter((f) => f.option.label.toLowerCase().includes(q))
}
