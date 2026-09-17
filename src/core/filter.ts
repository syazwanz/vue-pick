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

// Whether an option matches an already folded query. The label always counts;
// `searchKeys` adds fields read straight off the caller's object. A field can
// hold a string, a number, or an array of either, such as a list of tags.
export function optionMatches(
  option: OptionItem,
  foldedQuery: string,
  searchKeys?: string | readonly string[],
): boolean {
  if (foldForSearch(option.label ?? "").includes(foldedQuery)) return true
  if (!searchKeys) return false
  const raw = option.raw
  if (!raw || typeof raw !== "object") return false
  const keys = typeof searchKeys === "string" ? [searchKeys] : searchKeys
  for (const key of keys) {
    const field = (raw as Record<string, unknown>)[key]
    const values = Array.isArray(field) ? field : [field]
    for (const v of values) {
      if (typeof v !== "string" && typeof v !== "number") continue
      if (foldForSearch(String(v)).includes(foldedQuery)) return true
    }
  }
  return false
}

export function filterFlat(
  options: FlatOption[],
  query: string,
  searchKeys?: string | readonly string[],
): FlatOption[] {
  const q = foldForSearch(query.trim())
  if (!q) return options
  return options.filter((f) => optionMatches(f.option, q, searchKeys))
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
