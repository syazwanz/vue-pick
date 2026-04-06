// Core — framework-agnostic logic
// Option normalization, filtering, keyboard nav, selection state

export interface OptionItem {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  disabled?: boolean
  children?: OptionItem[]
}
