<script lang="ts">
export default { name: "VPick" }
</script>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  getCurrentInstance,
  toRaw,
} from "vue"
import {
  type OptionItem,
  type OptionOrGroup,
  type FlatOption,
  flattenOptions,
  generateId,
  normalizeOptions,
  filterFlat,
  filterFlatWith,
  computePosition,
  lockBodyScroll,
  unlockBodyScroll,
  setupScrollListeners,
  setupResizeObserver,
  isOptionGroup,
} from "../core"

const props = withDefaults(
  defineProps<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any
    options: readonly unknown[]
    id?: string
    name?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    loading?: boolean
    error?: string
    rotateIcon?: boolean
    separators?: boolean
    ariaLabel?: string
    ariaDescribedby?: string
    labelKey?: string
    valueKey?: string
    disabledKey?: string
    childrenKey?: string
    groupOptionsKey?: string
    teleportTo?: string | HTMLElement
    bodyLock?: boolean
    searchable?: boolean
    filter?: (option: OptionItem, query: string) => boolean
    noResultsText?: string
    clearable?: boolean
    multiple?: boolean
    defaultExpandLevel?: number
    disableBranchNodes?: boolean
    cascade?: boolean
    valueConsistsOf?:
      | "LEAF_PRIORITY"
      | "ALL"
      | "BRANCH_PRIORITY"
      | "ALL_WITH_INDETERMINATE"
    sortValueBy?: "ORDER_SELECTED" | "LEVEL" | "INDEX"
    clearOnSelect?: boolean
    closeOnSelect?: boolean
    noChildrenText?: string
  }>(),
  {
    value: undefined,
    id: undefined,
    name: undefined,
    placeholder: undefined,
    disabled: false,
    required: false,
    loading: false,
    error: undefined,
    rotateIcon: false,
    separators: false,
    ariaLabel: undefined,
    ariaDescribedby: undefined,
    labelKey: undefined,
    valueKey: undefined,
    disabledKey: undefined,
    childrenKey: undefined,
    groupOptionsKey: undefined,
    teleportTo: undefined,
    bodyLock: undefined,
    searchable: false,
    filter: undefined,
    noResultsText: "No results",
    clearable: false,
    multiple: false,
    defaultExpandLevel: undefined,
    disableBranchNodes: false,
    cascade: true,
    valueConsistsOf: "LEAF_PRIORITY",
    sortValueBy: "ORDER_SELECTED",
    clearOnSelect: true,
    // undefined means "close in single, stay open in multi". An explicit value
    // wins in both modes so the prop never silently does nothing.
    closeOnSelect: undefined,
    noChildrenText: "No sub-options",
  },
)

const emit = defineEmits<{
  (e: "input", value: OptionItem["value"] | OptionItem["value"][]): void
  (e: "search", query: string): void
  (e: "select", option: unknown): void
  (e: "deselect", option: unknown): void
}>()

const shouldCloseOnSelect = computed(
  () => props.closeOnSelect ?? !props.multiple,
)

// Hand back what the caller passed in, not our normalized copy.
function sourceOf(option: OptionItem): unknown {
  return toRaw(option.raw ?? option)
}

const isOpen = ref(false)
const highlightedIndex = ref(-1)
const searchQuery = ref("")
// True only while the user is actively typing into the input. Drives both the
// input's display (typed text vs. selectedLabel) and whether the filter
// applies — so opening a combobox with a selection shows the full list.
const isUserSearching = ref(false)
const isFormControl = ref(true)

// Multi-select renders as a combobox so chips and the input share one trigger.
const isSearchable = computed(() => props.searchable || props.multiple)

// The generated fallback stays stable for the instance's lifetime, but an
// explicit `id` prop has to win reactively: Vue reuses a single instance
// across sibling v-if branches, and a frozen id would leave a label's `for`
// pointing at whichever control rendered first.
const fallbackId = generateId()
const instanceId = computed(() => props.id ?? fallbackId)
const listboxId = computed(() => `${instanceId.value}-listbox`)

const normalized = computed(() =>
  normalizeOptions(props.options, {
    label: props.labelKey,
    value: props.valueKey,
    disabled: props.disabledKey,
    children: props.childrenKey,
    groupOptions: props.groupOptionsKey,
  }),
)

// --- Tree support ---

function hasAnyChildren(items: OptionOrGroup[]): boolean {
  for (const item of items) {
    if (isOptionGroup(item)) {
      if (hasAnyChildren(item.options)) return true
    } else {
      if (Array.isArray(item.children)) return true
    }
  }
  return false
}

const isTreeMode = computed(() => hasAnyChildren(normalized.value))

function collectInitialExpanded(
  items: OptionOrGroup[],
  maxDepth: number,
  depth = 0,
): Set<OptionItem["value"]> {
  const set = new Set<OptionItem["value"]>()
  if (depth >= maxDepth) return set
  for (const item of items) {
    if (isOptionGroup(item)) {
      for (const v of collectInitialExpanded(
        item.options as OptionOrGroup[],
        maxDepth,
        depth,
      )) {
        set.add(v)
      }
      continue
    }
    if (Array.isArray(item.children)) {
      set.add(item.value)
      for (const v of collectInitialExpanded(
        item.children as OptionOrGroup[],
        maxDepth,
        depth + 1,
      )) {
        set.add(v)
      }
    }
  }
  return set
}

const expandedSet = ref<Set<OptionItem["value"]>>(
  props.defaultExpandLevel
    ? collectInitialExpanded(normalized.value, props.defaultExpandLevel)
    : new Set(),
)

// Snapshot taken on the first search keystroke; restored when search clears (D6)
const preSearchExpandedSet = ref<Set<OptionItem["value"]> | null>(null)

function toggleExpand(value: OptionItem["value"]) {
  const next = new Set(expandedSet.value)
  if (next.has(value)) {
    next.delete(value)
  } else {
    next.add(value)
  }
  expandedSet.value = next
}

// Walk all nodes regardless of expansion to find ancestor values of matches.
function autoExpandForSearch(q: string) {
  const allFlat = flattenOptions(normalized.value, instanceId.value, "all")
  const ancestorValues = new Set<OptionItem["value"]>()
  for (const fo of allFlat) {
    const matches = props.filter
      ? props.filter(fo.option, q)
      : fo.option.label.toLowerCase().includes(q)
    if (!matches) continue
    let parentVal = fo.parentValue
    while (parentVal !== undefined) {
      ancestorValues.add(parentVal)
      const parentFo = allFlat.find((f) => f.option.value === parentVal)
      parentVal = parentFo?.parentValue
    }
  }
  const next = new Set(preSearchExpandedSet.value ?? expandedSet.value)
  for (const v of ancestorValues) next.add(v)
  expandedSet.value = next
}

// --- Cascade support ---

function getLeafDescendants(option: OptionItem): OptionItem["value"][] {
  if (!option.children?.length) return [option.value]
  return option.children.flatMap((c) => getLeafDescendants(c as OptionItem))
}

function compactToBranchPriority(
  leafSet: ReadonlySet<OptionItem["value"]>,
  items: OptionOrGroup[],
): OptionItem["value"][] {
  const result: OptionItem["value"][] = []
  for (const item of items) {
    if (isOptionGroup(item)) {
      result.push(...compactToBranchPriority(leafSet, item.options))
      continue
    }
    if (!item.children?.length) {
      if (leafSet.has(item.value)) result.push(item.value)
    } else {
      const leaves = getLeafDescendants(item)
      if (leaves.every((v) => leafSet.has(v))) {
        result.push(item.value)
      } else {
        result.push(
          ...compactToBranchPriority(leafSet, item.children as OptionOrGroup[]),
        )
      }
    }
  }
  return result
}

const isCascadeMode = computed(
  () => props.multiple && props.cascade && isTreeMode.value,
)

const effectiveLeafSet = computed<ReadonlySet<OptionItem["value"]>>(() => {
  if (!isCascadeMode.value) return selectedValues.value
  const arr = Array.isArray(props.value) ? props.value : []
  if (props.valueConsistsOf === "LEAF_PRIORITY") return new Set(arr)
  const set = new Set<OptionItem["value"]>()
  for (const v of arr) {
    const fo = flatAll.value.find((f) => f.option.value === v)
    if (!fo) continue
    if (fo.hasChildren) {
      for (const lv of getLeafDescendants(fo.option)) set.add(lv)
    } else {
      set.add(v)
    }
  }
  return set
})

// Order the emitted array and the chips. `flatAll` is a full document-order
// walk of the tree, so a value's position in it is its tree order; that spares
// us carrying an index path on every node.
function sortValues(values: OptionItem["value"][]): OptionItem["value"][] {
  if (props.sortValueBy === "ORDER_SELECTED") return values
  const pos = new Map<OptionItem["value"], number>()
  const depth = new Map<OptionItem["value"], number>()
  flatAll.value.forEach((fo, i) => {
    if (!pos.has(fo.option.value)) {
      pos.set(fo.option.value, i)
      depth.set(fo.option.value, fo.depth)
    }
  })
  const at = (v: OptionItem["value"]) => pos.get(v) ?? Number.MAX_SAFE_INTEGER
  const lvl = (v: OptionItem["value"]) =>
    depth.get(v) ?? Number.MAX_SAFE_INTEGER
  return [...values].sort((a, b) =>
    props.sortValueBy === "LEVEL" && lvl(a) !== lvl(b)
      ? lvl(a) - lvl(b)
      : at(a) - at(b),
  )
}

function emitFromLeafSet(
  newLeafSet: ReadonlySet<OptionItem["value"]>,
): OptionItem["value"][] {
  return sortValues(collectEmitValues(newLeafSet))
}

function collectEmitValues(
  newLeafSet: ReadonlySet<OptionItem["value"]>,
): OptionItem["value"][] {
  switch (props.valueConsistsOf) {
    case "ALL": {
      const result: OptionItem["value"][] = []
      const walkAll = (items: OptionOrGroup[]) => {
        for (const item of items) {
          if (isOptionGroup(item)) {
            walkAll(item.options)
            continue
          }
          if (!item.children?.length) {
            if (newLeafSet.has(item.value)) result.push(item.value)
          } else {
            const leaves = getLeafDescendants(item)
            if (leaves.every((v) => newLeafSet.has(v))) result.push(item.value)
            walkAll(item.children as OptionOrGroup[])
          }
        }
      }
      walkAll(normalized.value)
      return result
    }
    case "BRANCH_PRIORITY":
      return compactToBranchPriority(newLeafSet, normalized.value)
    case "ALL_WITH_INDETERMINATE": {
      const result: OptionItem["value"][] = []
      const walkAWI = (items: OptionOrGroup[]) => {
        for (const item of items) {
          if (isOptionGroup(item)) {
            walkAWI(item.options)
            continue
          }
          if (!item.children?.length) {
            if (newLeafSet.has(item.value)) result.push(item.value)
          } else {
            const leaves = getLeafDescendants(item)
            if (leaves.some((v) => newLeafSet.has(v))) {
              result.push(item.value)
              walkAWI(item.children as OptionOrGroup[])
            }
          }
        }
      }
      walkAWI(normalized.value)
      return result
    }
    case "LEAF_PRIORITY":
    default:
      return [...newLeafSet]
  }
}

function isCascadeChecked(fo: FlatOption): boolean {
  if (!isCascadeMode.value) return isSelected(fo.option.value)
  if (!fo.hasChildren) return effectiveLeafSet.value.has(fo.option.value)
  const leaves = getLeafDescendants(fo.option)
  return leaves.length > 0 && leaves.every((v) => effectiveLeafSet.value.has(v))
}

function isCascadeIndeterminate(fo: FlatOption): boolean {
  if (!isCascadeMode.value || !fo.hasChildren) return false
  const leaves = getLeafDescendants(fo.option)
  const n = leaves.filter((v) => effectiveLeafSet.value.has(v)).length
  return n > 0 && n < leaves.length
}

// --- /Cascade support ---

// --- /Tree support ---

const flat = computed<FlatOption[]>(() =>
  flattenOptions(normalized.value, instanceId.value, expandedSet.value),
)

// Full tree walk (no expansion gating) — used by the hidden select so the
// selected value is always represented regardless of collapse state.
const flatAll = computed<FlatOption[]>(() =>
  isTreeMode.value
    ? flattenOptions(normalized.value, instanceId.value, "all")
    : flat.value,
)

const filteredFlat = computed<FlatOption[]>(() => {
  // Only filter when the user is actively typing. Opening the dropdown with a
  // selection should show the full list (WAI-ARIA combobox pattern).
  if (!isUserSearching.value) return flat.value
  if (isTreeMode.value) {
    // Show expanded branch nodes (ancestors of matches) + matching nodes.
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return flat.value
    return flat.value.filter((fo) => {
      if (fo.isEmptyMessage) return false
      if (fo.hasChildren && fo.isExpanded) return true
      return props.filter
        ? props.filter(fo.option, searchQuery.value.trim())
        : fo.option.label.toLowerCase().includes(q)
    })
  }
  if (props.filter) {
    return filterFlatWith(flat.value, searchQuery.value, props.filter)
  }
  return filterFlat(flat.value, searchQuery.value)
})

interface Section {
  label?: string
  labelId?: string
  items: { fo: FlatOption; flatIdx: number }[]
}

const sections = computed<Section[]>(() => {
  const result: Section[] = []
  let current: Section | null = null
  filteredFlat.value.forEach((fo, flatIdx) => {
    const key = fo.groupLabel ?? ""
    if (!current || (current.label ?? "") !== key) {
      current = {
        label: fo.groupLabel,
        labelId: fo.groupLabel
          ? `${instanceId.value}-grp-${flatIdx}`
          : undefined,
        items: [],
      }
      result.push(current)
    }
    current.items.push({ fo, flatIdx })
  })
  return result
})

// Set of selected values for O(1) lookups in multi mode
const selectedValues = computed<Set<OptionItem["value"]>>(() => {
  if (!props.multiple) return new Set()
  const arr = Array.isArray(props.value) ? props.value : []
  return new Set(arr)
})

function isSelected(value: OptionItem["value"]): boolean {
  if (props.multiple) return selectedValues.value.has(value)
  return props.value === value
}

// Ordered list of selected option objects for rendering chips.
// In cascade mode, always display in BRANCH_PRIORITY format (most compact) so
// selecting a parent shows one chip, not one chip per leaf.
const selectedOptions = computed(() => {
  if (!props.multiple) return []
  const displayValues = isCascadeMode.value
    ? compactToBranchPriority(effectiveLeafSet.value, normalized.value)
    : Array.isArray(props.value)
      ? props.value
      : []
  return sortValues(displayValues)
    .map((v) => flatAll.value.find((f) => f.option.value === v))
    .filter(Boolean) as FlatOption[]
})

const selectedOption = computed<OptionItem | null>(() => {
  if (props.value == null) return null
  return (
    flatAll.value.find((f) => f.option.value === props.value)?.option ?? null
  )
})

const selectedLabel = computed(() => selectedOption.value?.label ?? "")

const showEmpty = computed(
  () =>
    isSearchable.value &&
    isOpen.value &&
    !props.loading &&
    searchQuery.value.trim().length > 0 &&
    filteredFlat.value.length === 0,
)

const hiddenSelectValue = computed<string | string[]>(() => {
  if (props.multiple) {
    return Array.isArray(props.value) ? props.value.map(String) : []
  }
  return String(props.value ?? "")
})

const canClear = computed(() => {
  if (!props.clearable || props.disabled || props.loading) return false
  if (props.multiple) {
    return Array.isArray(props.value) && props.value.length > 0
  }
  return props.value != null
})

const instance = getCurrentInstance()
const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const listboxRef = ref<HTMLDivElement | null>(null)
const positionerRef = ref<HTMLDivElement | null>(null)
const hiddenSelectRef = ref<HTMLSelectElement | null>(null)

const positionerStyle = ref<Record<string, string>>({})
const placement = ref<"top" | "bottom">("bottom")

function getRootEl(): HTMLElement | null {
  return (
    rootRef.value ?? (instance?.proxy?.$el as HTMLElement | undefined) ?? null
  )
}

const FORWARDED_VARS = [
  "--vpick-listbox-min-width",
  "--vpick-listbox-max-width",
  "--vpick-listbox-max-height",
  "--vpick-listbox-bg",
  "--vpick-listbox-shadow",
  "--vpick-listbox-ring",
  "--vpick-listbox-z-index",
  "--vpick-option-hover-bg",
  "--vpick-option-highlight-bg",
  "--vpick-option-selected-color",
  "--vpick-option-check-color",
  "--vpick-option-radius",
  "--vpick-group-label-color",
  "--vpick-group-label-size",
  "--vpick-border-radius",
  "--vpick-border-color",
  "--vpick-font-family",
  "--vpick-font-size",
  "--vpick-line-height",
  "--vpick-text-color",
  "--vpick-disabled-opacity",
  "--vpick-empty-color",
  "--vpick-empty-padding",
  "--vpick-tree-indent",
]

function forwardedVars(): Record<string, string> {
  const root = getRootEl()
  if (!root) return {}
  const cs = getComputedStyle(root)
  const out: Record<string, string> = {}
  for (const name of FORWARDED_VARS) {
    const inline = root.style.getPropertyValue(name).trim()
    if (inline) {
      out[name] = inline
      continue
    }
    const computed = cs.getPropertyValue(name).trim()
    if (computed) out[name] = computed
  }
  return out
}

function resolveTeleportTarget(): HTMLElement {
  const to = props.teleportTo
  if (to instanceof HTMLElement) return to
  if (typeof to === "string") {
    const el = document.querySelector(to)
    if (el instanceof HTMLElement) return el
  }
  return document.body
}

async function updatePosition(skipSecondPass = false) {
  const trigger = triggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  // Searchable uses a larger offset so the 3px focus ring on the input has
  // breathing room from the dropdown.
  const offset = isSearchable.value ? 6 : 4
  const vpHeight = typeof window !== "undefined" ? window.innerHeight : 0
  const initialHeight = listboxRef.value?.offsetHeight || 240
  const initial = computePosition(rect, initialHeight, vpHeight, offset)
  placement.value = initial.placement
  const forwarded = forwardedVars()

  positionerStyle.value = {
    ...forwarded,
    position: "fixed",
    top: "0px",
    left: "0px",
    transform: `translate3d(${initial.left}px, ${initial.top}px, 0)`,
    "--vpick-trigger-width": `${rect.width}px`,
  }
  // During scroll the listbox height is already known, so the second-pass
  // height correction (the nextTick remeasure below) only matters at open
  // time. Skipping it removes a one-frame jitter on scroll.
  if (skipSecondPass) return
  await nextTick()
  const el = listboxRef.value
  if (!el) return
  const measured = computePosition(
    trigger.getBoundingClientRect(),
    el.offsetHeight,
    vpHeight,
    offset,
  )
  placement.value = measured.placement
  positionerStyle.value = {
    ...forwarded,
    position: "fixed",
    top: "0px",
    left: "0px",
    transform: `translate3d(${measured.left}px, ${measured.top}px, 0)`,
    "--vpick-trigger-width": `${rect.width}px`,
  }
}

function onReposition(e?: Event) {
  if (!isOpen.value) return
  const target = e?.target
  if (target instanceof Node && positionerRef.value?.contains(target)) return
  updatePosition(true)
}

// Vue 2.7's `flush: "post"` fires before the hidden select's :value binding
// has been patched, so change events would carry the stale value. Explicitly
// awaiting nextTick mirrors Vue 3's post-flush timing.
// Also: Vue 2 only auto-syncs HTMLOptionElement.selected via the v-model
// directive's special-case for <select multiple>. With :value alone the
// option.selected props stay false, so form submission would lose all values.
// Manually mirror the array onto each option.
function syncMultiSelectOptions() {
  if (!props.multiple) return
  const select = hiddenSelectRef.value
  if (!select) return
  const arr = Array.isArray(props.value) ? props.value.map(String) : []
  for (const opt of Array.from(select.options)) {
    opt.selected = arr.includes(opt.value)
  }
}

watch(
  () => props.value,
  async () => {
    await nextTick()
    const select = hiddenSelectRef.value
    if (!select) return
    syncMultiSelectOptions()
    select.dispatchEvent(new Event("change", { bubbles: true }))
  },
)

// Listbox height changes when the filtered list grows/shrinks. Reposition so
// the popup stays anchored, especially when flipped above the trigger.
watch(
  () => filteredFlat.value.length,
  () => {
    if (!isOpen.value) return
    nextTick(updatePosition)
  },
)

// Placeholder rows under empty branches are inert: never highlighted, never
// reachable by arrow keys.
function isNavigable(f: FlatOption): boolean {
  return !f.isEmptyMessage && !f.option.disabled && !f.groupDisabled
}

function highlightDefault() {
  const list = filteredFlat.value
  if (props.multiple) {
    // In multi mode, always highlight first enabled option
    highlightedIndex.value = list.findIndex(isNavigable)
    return
  }
  const idx = list.findIndex(
    (f) => f.option.value === props.value && !f.option.disabled,
  )
  highlightedIndex.value = idx >= 0 ? idx : list.findIndex(isNavigable)
}

let scrollLocked = false
let cleanupScroll: (() => void) | null = null
let cleanupResize: (() => void) | null = null

function open() {
  if (props.disabled || props.loading) return
  if (isOpen.value) return
  isOpen.value = true
  highlightDefault()
  // Default: lock body scroll for button mode (select-like, modal feel),
  // leave unlocked for searchable mode (combobox, persistent typeahead).
  const shouldLock = props.bodyLock ?? !isSearchable.value
  if (shouldLock) {
    lockBodyScroll()
    scrollLocked = true
  }
  nextTick(() => {
    updatePosition()
    if (triggerRef.value && !cleanupScroll) {
      cleanupScroll = setupScrollListeners(triggerRef.value, onReposition)
    }
    // Reposition when the trigger height changes (e.g. multi-select chips wrap
    // onto additional rows).
    if (triggerRef.value && !cleanupResize) {
      cleanupResize = setupResizeObserver(triggerRef.value, () => {
        if (isOpen.value) updatePosition()
      })
    }
  })
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  highlightedIndex.value = -1
  // Defer searchQuery + isUserSearching reset to onAfterLeave so the dropdown
  // doesn't flicker to the full list mid-fade. Input text is part of the
  // displayed state, so it stays frozen during the leave animation too.
  if (scrollLocked) {
    unlockBodyScroll()
    scrollLocked = false
  }
  if (cleanupScroll) {
    cleanupScroll()
    cleanupScroll = null
  }
  if (cleanupResize) {
    cleanupResize()
    cleanupResize = null
  }
}

function onAfterLeave() {
  searchQuery.value = ""
  isUserSearching.value = false
  // If dropdown closes while tree search was active, restore pre-search expansion (D6)
  if (preSearchExpandedSet.value !== null) {
    expandedSet.value = preSearchExpandedSet.value
    preSearchExpandedSet.value = null
  }
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function onSearchTriggerClick(e: MouseEvent) {
  if (props.disabled || props.loading) return
  // Clicks on the dead area around the input (e.g. right-edge padding) focus
  // the input, which fires @focus="open". Skip if the click already landed on
  // the input or an interactive child — they handle themselves.
  const target = e.target as HTMLElement | null
  if (!target) return
  if (target.closest("input, .vpick-trigger-icon--button, .vpick-clear")) return
  inputRef.value?.focus()
}

function onChevronClick() {
  // Route clicks on the searchable chevron to the input so focus lands there
  // and the ring stays visible. Branch explicitly — calling toggle() after
  // focus() races with @focus="open" and flips the state twice.
  if (isOpen.value) {
    close()
  } else {
    inputRef.value?.focus()
    open()
  }
}

function focusTrigger() {
  if (isSearchable.value) inputRef.value?.focus()
  else (triggerRef.value as HTMLButtonElement | null)?.focus()
}

function selectOption(flatOption: FlatOption) {
  if (flatOption.isEmptyMessage) return
  if (flatOption.option.disabled || flatOption.groupDisabled) return
  // A branch that cannot be selected has nothing else the row click could
  // mean, so it expands. D9 keeps row-selects/chevron-expands only where the
  // branch IS selectable, which is the genuinely ambiguous case.
  if (props.disableBranchNodes && flatOption.isBranch) {
    toggleExpand(flatOption.option.value)
    return
  }
  const source = sourceOf(flatOption.option)
  if (props.multiple) {
    if (isCascadeMode.value) {
      const leaves = getLeafDescendants(flatOption.option)
      const newLeafSet = new Set(effectiveLeafSet.value)
      const wasChecked = isCascadeChecked(flatOption)
      if (wasChecked) {
        for (const v of leaves) newLeafSet.delete(v)
      } else {
        for (const v of leaves) newLeafSet.add(v)
      }
      emit("input", emitFromLeafSet(newLeafSet))
      if (wasChecked) emit("deselect", source)
      else emit("select", source)
    } else {
      const arr = Array.isArray(props.value) ? props.value : []
      const val = flatOption.option.value
      if (selectedValues.value.has(val)) {
        emit("input", sortValues(arr.filter((v) => v !== val)))
        emit("deselect", source)
      } else {
        emit("input", sortValues([...arr, val]))
        emit("select", source)
      }
    }
    if (props.clearOnSelect) {
      searchQuery.value = ""
      isUserSearching.value = false
      emit("search", "")
    }
    if (shouldCloseOnSelect.value) close()
    return
  }
  emit("input", flatOption.option.value)
  emit("select", source)
  if (shouldCloseOnSelect.value) close()
}

function removeChip(value: OptionItem["value"]) {
  if (props.disabled) return
  if (isCascadeMode.value) {
    const fo = flatAll.value.find((f) => f.option.value === value)
    if (fo) {
      const leaves = getLeafDescendants(fo.option)
      const newLeafSet = new Set(effectiveLeafSet.value)
      for (const v of leaves) newLeafSet.delete(v)
      emit("input", emitFromLeafSet(newLeafSet))
    }
  } else {
    const arr = Array.isArray(props.value) ? props.value : []
    emit(
      "input",
      arr.filter((v) => v !== value),
    )
  }
  focusTrigger()
}

function onClear() {
  if (!canClear.value) return
  emit("input", props.multiple ? [] : undefined)
  searchQuery.value = ""
  isUserSearching.value = false
  focusTrigger()
}

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  searchQuery.value = value
  isUserSearching.value = true
  if (!isOpen.value) open()
  emit("search", value)

  if (isTreeMode.value) {
    const q = value.trim().toLowerCase()
    if (q) {
      // Snapshot expansion on first keystroke (D6)
      if (preSearchExpandedSet.value === null) {
        preSearchExpandedSet.value = new Set(expandedSet.value)
      }
      autoExpandForSearch(q)
    } else if (preSearchExpandedSet.value !== null) {
      // Query cleared: restore pre-search expansion (D6)
      expandedSet.value = preSearchExpandedSet.value
      preSearchExpandedSet.value = null
    }
  }

  nextTick(() => {
    const list = filteredFlat.value
    if (list.length === 0) {
      highlightedIndex.value = -1
      return
    }
    const cur = highlightedIndex.value
    const valid = cur >= 0 && cur < list.length && isNavigable(list[cur])
    if (!valid) {
      highlightedIndex.value = list.findIndex(isNavigable)
    }
  })
}

function scrollHighlightedIntoView() {
  const lb = listboxRef.value
  const idx = highlightedIndex.value
  if (!lb || idx < 0) return
  const fo = filteredFlat.value[idx]
  if (!fo) return
  const el = lb.querySelector<HTMLElement>(`#${fo.id}`)
  if (!el) return
  // Manual adjustment instead of Element.scrollIntoView — that API scrolls
  // ancestors in the DOM tree, which for a fixed-positioned teleported
  // listbox causes the page to scroll to the element's pre-teleport position.
  // Use getBoundingClientRect rather than offsetTop: offsetTop depends on
  // offsetParent, which is body until the listbox gets position:fixed inline.
  // In Vue 2 there's a frame where the listbox is visible but not yet
  // positioned, and offsetTop returns a body-relative value that clamps the
  // scroll to the max.
  const lbRect = lb.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const relTop = elRect.top - lbRect.top + lb.scrollTop
  const relBottom = relTop + elRect.height
  const viewTop = lb.scrollTop
  const viewBottom = viewTop + lb.clientHeight
  if (relTop < viewTop) lb.scrollTop = relTop
  else if (relBottom > viewBottom) lb.scrollTop = relBottom - lb.clientHeight
}

watch(highlightedIndex, () => {
  nextTick(scrollHighlightedIntoView)
})

function onKeydown(e: KeyboardEvent) {
  // Backspace on empty search input removes last chip in multi mode
  if (
    props.multiple &&
    isSearchable.value &&
    e.key === "Backspace" &&
    searchQuery.value === "" &&
    selectedOptions.value.length > 0
  ) {
    const last = selectedOptions.value[selectedOptions.value.length - 1]
    if (last && !last.option.disabled) {
      removeChip(last.option.value)
    }
    return
  }

  if (!isOpen.value) {
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Enter" ||
      (!isSearchable.value && e.key === " ")
    ) {
      e.preventDefault()
      open()
    } else if (e.key === "Escape" && isSearchable.value && canClear.value) {
      // WAI-ARIA combobox pattern: when the popup is closed, Escape clears
      // the value. Searchable mode only — button mode follows native select.
      e.preventDefault()
      onClear()
    }
    return
  }

  const list = filteredFlat.value
  const enabledIndices = list
    .map((f, i) => (isNavigable(f) ? i : -1))
    .filter((i) => i >= 0)

  switch (e.key) {
    case "ArrowDown": {
      e.preventDefault()
      const cur = enabledIndices.indexOf(highlightedIndex.value)
      if (cur < enabledIndices.length - 1) {
        highlightedIndex.value = enabledIndices[cur + 1]
      }
      break
    }
    case "ArrowUp": {
      e.preventDefault()
      const cur = enabledIndices.indexOf(highlightedIndex.value)
      if (cur > 0) {
        highlightedIndex.value = enabledIndices[cur - 1]
      }
      break
    }
    case "Home": {
      e.preventDefault()
      highlightedIndex.value = enabledIndices[0] ?? -1
      break
    }
    case "End": {
      e.preventDefault()
      highlightedIndex.value = enabledIndices[enabledIndices.length - 1] ?? -1
      break
    }
    case "Enter": {
      e.preventDefault()
      if (highlightedIndex.value >= 0 && list[highlightedIndex.value]) {
        selectOption(list[highlightedIndex.value])
      } else if (isSearchable.value && list.length === 0) {
        // No match to commit — close and let onAfterLeave clear the query.
        close()
      }
      break
    }
    case " ": {
      if (isSearchable.value) return
      e.preventDefault()
      if (highlightedIndex.value >= 0 && list[highlightedIndex.value]) {
        selectOption(list[highlightedIndex.value])
      }
      break
    }
    case "Escape": {
      e.preventDefault()
      close()
      focusTrigger()
      break
    }
    case "ArrowRight": {
      if (!isTreeMode.value) return
      e.preventDefault()
      const fo = list[highlightedIndex.value]
      if (!fo || !fo.isBranch) return
      if (!fo.isExpanded) {
        toggleExpand(fo.option.value)
        // Move focus to first child after expand
        const newList = filteredFlat.value
        const childIdx = newList.findIndex(
          (f) =>
            f.parentValue === fo.option.value &&
            !f.option.disabled &&
            !f.groupDisabled,
        )
        if (childIdx >= 0) highlightedIndex.value = childIdx
      } else {
        // Already expanded: move to first child
        const childIdx = list.findIndex(
          (f) =>
            f.parentValue === fo.option.value &&
            !f.option.disabled &&
            !f.groupDisabled,
        )
        if (childIdx >= 0) highlightedIndex.value = childIdx
      }
      break
    }
    case "ArrowLeft": {
      if (!isTreeMode.value) return
      e.preventDefault()
      const fo = list[highlightedIndex.value]
      if (!fo) return
      if (fo.isBranch && fo.isExpanded) {
        toggleExpand(fo.option.value)
      } else if (fo.parentValue !== undefined) {
        const parentIdx = list.findIndex(
          (f) => f.option.value === fo.parentValue,
        )
        if (parentIdx >= 0) highlightedIndex.value = parentIdx
      }
      break
    }
  }
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (getRootEl()?.contains(target)) return
  if (positionerRef.value?.contains(target)) return
  close()
}

onMounted(async () => {
  document.addEventListener("mousedown", onClickOutside)
  await nextTick()
  isFormControl.value = !!getRootEl()?.closest("form")
  await nextTick()
  syncMultiSelectOptions()
  // Move the positioner DOM node to the teleport target. Vue's vnode keeps
  // the reference, so patching continues to work from the new location. The
  // listbox is a child of the positioner and travels with it.
  if (positionerRef.value) {
    resolveTeleportTarget().appendChild(positionerRef.value)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onClickOutside)
  if (cleanupScroll) {
    cleanupScroll()
    cleanupScroll = null
  }
  if (cleanupResize) {
    cleanupResize()
    cleanupResize = null
  }
  if (scrollLocked) {
    unlockBodyScroll()
    scrollLocked = false
  }
  if (positionerRef.value?.parentNode) {
    positionerRef.value.parentNode.removeChild(positionerRef.value)
  }
})
</script>

<template>
  <div
    ref="rootRef"
    :class="['vpick', { 'vpick--rotate-icon': rotateIcon }]"
    role="none"
  >
    <!-- Button trigger (non-searchable) -->
    <button
      v-if="!isSearchable"
      :id="instanceId"
      ref="triggerRef"
      type="button"
      role="combobox"
      :class="[
        'vpick-trigger',
        { 'vpick-trigger--multi': multiple },
        { 'vpick-trigger--open': isOpen },
        { 'vpick-trigger--error': error },
        { 'vpick-trigger--loading': loading },
      ]"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-haspopup="'listbox'"
      :aria-activedescendant="
        isOpen && highlightedIndex >= 0 && filteredFlat[highlightedIndex]
          ? filteredFlat[highlightedIndex].id
          : undefined
      "
      :aria-controls="listboxId"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="error ? 'true' : undefined"
      :aria-busy="loading ? 'true' : undefined"
      :disabled="disabled || loading"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span
        class="vpick-trigger-label"
        :class="{ 'vpick-trigger-placeholder': !selectedLabel }"
      >
        <slot
          v-if="selectedOption"
          name="value-label"
          :option="selectedOption"
          >{{ selectedLabel }}</slot
        >
        <template v-else>{{ placeholder || "\u00A0" }}</template>
      </span>
      <span
        v-if="loading"
        class="vpick-trigger-icon vpick-trigger-spinner"
        aria-hidden="true"
      >
        <slot name="loading">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </slot>
      </span>
      <span
        v-else-if="canClear"
        class="vpick-clear"
        role="button"
        tabindex="-1"
        aria-label="Clear selection"
        @mousedown.prevent
        @click.stop="onClear"
      >
        <slot name="clear">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </slot>
      </span>
      <span v-else class="vpick-trigger-icon" aria-hidden="true">
        <slot name="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </slot>
      </span>
    </button>

    <!-- Input trigger (searchable) -->
    <div
      v-else
      ref="triggerRef"
      :class="[
        'vpick-trigger',
        'vpick-trigger--search',
        { 'vpick-trigger--multi': multiple },
        { 'vpick-trigger--open': isOpen },
        { 'vpick-trigger--error': error },
        { 'vpick-trigger--loading': loading },
        { 'vpick-trigger--disabled': disabled || loading },
      ]"
      @click="onSearchTriggerClick"
    >
      <!-- Chips for multi-select -->
      <span
        v-for="fo in selectedOptions"
        :key="String(fo.option.value)"
        class="vpick-chip"
      >
        <span class="vpick-chip-label"
          ><slot name="value-label" :option="fo.option">{{
            fo.option.label
          }}</slot></span
        >
        <button
          type="button"
          class="vpick-chip-remove"
          tabindex="-1"
          :disabled="disabled || loading"
          :aria-label="`Remove ${fo.option.label}`"
          @mousedown.prevent
          @click.stop="removeChip(fo.option.value)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </span>
      <input
        :id="instanceId"
        ref="inputRef"
        type="text"
        role="combobox"
        class="vpick-trigger-input"
        autocomplete="off"
        spellcheck="false"
        aria-autocomplete="list"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-haspopup="'listbox'"
        :aria-controls="listboxId"
        :aria-activedescendant="
          isOpen && highlightedIndex >= 0 && filteredFlat[highlightedIndex]
            ? filteredFlat[highlightedIndex].id
            : undefined
        "
        :aria-label="ariaLabel"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="error ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
        :disabled="disabled || loading"
        :placeholder="
          multiple
            ? selectedOptions.length
              ? undefined
              : placeholder
            : selectedLabel || placeholder
        "
        :value="isUserSearching ? searchQuery : multiple ? '' : selectedLabel"
        @input="onInput"
        @keydown="onKeydown"
        @focus="open"
        @click="open"
      />
      <span
        v-if="loading"
        class="vpick-trigger-icon vpick-trigger-spinner"
        aria-hidden="true"
      >
        <slot name="loading">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </slot>
      </span>
      <span
        v-else-if="canClear"
        class="vpick-clear"
        role="button"
        tabindex="-1"
        aria-label="Clear selection"
        @mousedown.prevent
        @click.stop="onClear"
      >
        <slot name="clear">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </slot>
      </span>
      <button
        v-else
        type="button"
        class="vpick-trigger-icon vpick-trigger-icon--button"
        tabindex="-1"
        aria-hidden="true"
        :disabled="disabled || loading"
        @mousedown.prevent
        @click="onChevronClick"
      >
        <slot name="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </slot>
      </button>
    </div>

    <!-- Dropdown positioner + listbox (portaled to body via DOM move on
         mount). Positioner owns position (transform: translate3d on a
         hardware-accelerated layer); listbox owns the enter-leave animation.
         Splitting them is required because two transforms can't coexist on
         the same element. -->
    <transition name="vpick-dropdown" @after-leave="onAfterLeave">
      <div
        v-show="isOpen"
        ref="positionerRef"
        class="vpick-positioner"
        :style="positionerStyle"
        :data-placement="placement"
        @mousedown.prevent
      >
        <div
          :id="listboxId"
          ref="listboxRef"
          role="listbox"
          class="vpick-listbox"
          :aria-multiselectable="multiple ? 'true' : undefined"
        >
          <div v-for="(section, si) in sections" :key="'s' + si">
            <div
              v-if="separators && si > 0"
              role="separator"
              class="vpick-separator"
              aria-hidden="true"
            />
            <div
              class="vpick-group"
              :role="section.label ? 'group' : undefined"
              :aria-labelledby="section.labelId"
            >
              <div
                v-if="section.label"
                :id="section.labelId"
                class="vpick-group-label"
              >
                {{ section.label }}
              </div>
              <template v-for="item in section.items">
                <div
                  v-if="item.fo.isEmptyMessage"
                  :key="item.fo.id"
                  class="vpick-option-empty"
                  :style="{ '--vpick-option-depth': item.fo.depth }"
                >
                  <slot name="no-children" :option="item.fo.option">{{
                    noChildrenText
                  }}</slot>
                </div>
                <div
                  v-else
                  :id="item.fo.id"
                  :key="item.fo.id"
                  role="option"
                  :data-depth="isTreeMode ? item.fo.depth : undefined"
                  :style="
                    isTreeMode && item.fo.depth > 0
                      ? { '--vpick-option-depth': item.fo.depth }
                      : undefined
                  "
                  :class="[
                    'vpick-option',
                    {
                      'vpick-option--tree': isTreeMode,
                      'vpick-option--branch': item.fo.isBranch,
                      'vpick-option--leaf': isTreeMode && !item.fo.isBranch,
                      'vpick-option--multi': multiple,
                      'vpick-option--highlighted':
                        item.flatIdx === highlightedIndex,
                      'vpick-option--selected': isSelected(
                        item.fo.option.value,
                      ),
                      'vpick-option--disabled':
                        item.fo.option.disabled || item.fo.groupDisabled,
                    },
                  ]"
                  :aria-selected="
                    (
                      multiple
                        ? isCascadeChecked(item.fo)
                        : isSelected(item.fo.option.value)
                    )
                      ? 'true'
                      : 'false'
                  "
                  :aria-disabled="
                    item.fo.option.disabled ||
                    item.fo.groupDisabled ||
                    (disableBranchNodes && item.fo.isBranch)
                      ? 'true'
                      : undefined
                  "
                  :aria-expanded="
                    item.fo.hasChildren
                      ? item.fo.isExpanded
                        ? 'true'
                        : 'false'
                      : undefined
                  "
                  @click="selectOption(item.fo)"
                  @mouseenter="
                    !(item.fo.option.disabled || item.fo.groupDisabled) &&
                    (highlightedIndex = item.flatIdx)
                  "
                >
                  <span
                    v-if="multiple"
                    :class="[
                      'vpick-option-checkbox',
                      {
                        'vpick-option-checkbox--checked': isCascadeChecked(
                          item.fo,
                        ),
                        'vpick-option-checkbox--indeterminate':
                          isCascadeIndeterminate(item.fo),
                      },
                    ]"
                    aria-hidden="true"
                  >
                    <svg
                      v-if="isCascadeChecked(item.fo)"
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <svg
                      v-else-if="isCascadeIndeterminate(item.fo)"
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                  <!-- Tree expand chevron (branch nodes) or alignment spacer (leaves) -->
                  <button
                    v-if="isTreeMode && item.fo.isBranch"
                    type="button"
                    :class="[
                      'vpick-option-expand',
                      { 'vpick-option-expand--expanded': item.fo.isExpanded },
                    ]"
                    tabindex="-1"
                    aria-hidden="true"
                    @mousedown.prevent
                    @click.stop="toggleExpand(item.fo.option.value)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                  <span
                    v-else-if="isTreeMode"
                    class="vpick-option-expand-spacer"
                    aria-hidden="true"
                  />
                  <span class="vpick-option-label">{{
                    item.fo.option.label
                  }}</span>
                  <span
                    v-if="!multiple"
                    class="vpick-option-check"
                    aria-hidden="true"
                  >
                    <svg
                      v-if="isSelected(item.fo.option.value)"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                </div>
              </template>
            </div>
          </div>
          <div v-if="showEmpty" class="vpick-empty">
            <slot name="empty" :query="searchQuery">{{ noResultsText }}</slot>
          </div>
        </div>
      </div>
    </transition>

    <!-- Visually hidden select for form submission + validation -->
    <!-- Vue 2 doesn't honor :selected on <option> the way Vue 3 does; bind the
         array on the select itself so its multi-select sync marks options. -->
    <select
      v-if="isFormControl"
      ref="hiddenSelectRef"
      :name="name"
      :required="required"
      :disabled="disabled"
      :multiple="multiple || undefined"
      tabindex="-1"
      aria-hidden="true"
      class="vpick-hidden-select"
      :value="hiddenSelectValue"
    >
      <option v-if="!multiple" value="" />
      <option
        v-for="item in flatAll"
        :key="String(item.option.value)"
        :value="String(item.option.value)"
      >
        {{ item.option.label }}
      </option>
    </select>
  </div>
</template>
