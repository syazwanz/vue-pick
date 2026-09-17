import type { OptionItem } from "./index"
import type { FlatOption } from "./flatten"

// The form both sides of a built-in match are compared in: lower case, with
// accents stripped, so "cafe" finds "Café" and "Müller" finds "muller". Only
// the combining marks Latin, Greek and Cyrillic accents decompose into are
// removed. Marks that carry meaning in other scripts, such as vowel signs, are
// left alone, and letters with no decomposition (ø, ł, ß) stay as they are.
export function foldForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function filterFlat(options: FlatOption[], query: string): FlatOption[] {
  const q = foldForSearch(query.trim())
  if (!q) return options
  return options.filter((f) => foldForSearch(f.option.label).includes(q))
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
