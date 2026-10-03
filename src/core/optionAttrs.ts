import type { OptionItem } from "./index"

export type OptionAttrsFn = (
  option: OptionItem,
) => Record<string, unknown> | null | undefined

export interface ResolvedOptionAttrs {
  attrs: Record<string, unknown>
  // Whatever Vue accepts for `class` and `style`, passed through untouched.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any
}

export const NO_OPTION_ATTRS: ResolvedOptionAttrs = { attrs: {} }

// Attributes VPick owns on an option row. Keyboard navigation, screen reader
// state and the documented CSS hooks depend on them, so a consumer value never
// replaces them. `on*` is blocked too: a bound object would attach it as a
// listener and bypass the row's own click handling.
function isReserved(key: string): boolean {
  const k = key.toLowerCase()
  return (
    k === "id" ||
    k === "role" ||
    k === "tabindex" ||
    k === "key" ||
    k === "ref" ||
    k === "data-value" ||
    k === "data-depth" ||
    k.startsWith("aria-") ||
    k.startsWith("on")
  )
}

// `class` and `style` are split out so the row can merge them with its own.
// Vue 2 drops them from a bound object when the element sets its own.
export function resolveOptionAttrs(
  fn: OptionAttrsFn | undefined,
  option: OptionItem,
): ResolvedOptionAttrs {
  if (!fn) return NO_OPTION_ATTRS
  const raw = fn(option)
  if (!raw || typeof raw !== "object") return NO_OPTION_ATTRS
  const result: ResolvedOptionAttrs = { attrs: {} }
  for (const key of Object.keys(raw)) {
    if (key === "class") result.class = raw[key]
    else if (key === "style") result.style = raw[key]
    else if (!isReserved(key)) result.attrs[key] = raw[key]
  }
  return result
}
