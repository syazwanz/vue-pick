<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import {
  type OptionItem,
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
} from "../core"

defineOptions({ name: "VPick" })

const props = withDefaults(
  defineProps<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelValue?: any
    options: readonly unknown[]
    id?: string
    name?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    loading?: boolean
    error?: string
    size?: "sm" | "default"
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
  }>(),
  {
    modelValue: undefined,
    id: undefined,
    name: undefined,
    placeholder: undefined,
    disabled: false,
    required: false,
    loading: false,
    error: undefined,
    size: "default",
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
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: OptionItem["value"] | OptionItem["value"][]]
  search: [query: string]
}>()

const isOpen = ref(false)
const highlightedIndex = ref(-1)
const searchQuery = ref("")
// True only while the user is actively typing into the input. Drives both the
// input's display (typed text vs. selectedLabel) and whether the filter
// applies — so opening a combobox with a selection shows the full list.
const isUserSearching = ref(false)
// Default true for SSR — adjusted on mount by checking closest('form')
const isFormControl = ref(true)

// Multiple mode always uses the searchable (combobox) trigger — matching
// shadcn behaviour where multi-select is only offered as a combobox.
const isSearchable = computed(() => props.searchable || props.multiple)

// shadcn only has size variants on the select trigger, not the combobox.
const effectiveSize = computed(() =>
  isSearchable.value ? "default" : (props.size ?? "default"),
)

const instanceId = props.id ?? generateId()
const listboxId = `${instanceId}-listbox`

const normalized = computed(() =>
  normalizeOptions(props.options, {
    label: props.labelKey,
    value: props.valueKey,
    disabled: props.disabledKey,
    children: props.childrenKey,
    groupOptions: props.groupOptionsKey,
  }),
)

const flat = computed<FlatOption[]>(() =>
  flattenOptions(normalized.value, instanceId),
)

const filteredFlat = computed<FlatOption[]>(() => {
  if (!isSearchable.value) return flat.value
  // Only filter when the user is actively typing. Opening the dropdown with a
  // selection should show the full list (WAI-ARIA combobox pattern).
  if (!isUserSearching.value) return flat.value
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
        labelId: fo.groupLabel ? `${instanceId}-grp-${flatIdx}` : undefined,
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
  const arr = Array.isArray(props.modelValue) ? props.modelValue : []
  return new Set(arr)
})

function isSelected(value: OptionItem["value"]): boolean {
  if (props.multiple) return selectedValues.value.has(value)
  return props.modelValue === value
}

// Ordered list of selected option objects for rendering chips
const selectedOptions = computed(() => {
  if (!props.multiple) return []
  const arr = Array.isArray(props.modelValue) ? props.modelValue : []
  return arr
    .map((v) => flat.value.find((f) => f.option.value === v))
    .filter(Boolean) as FlatOption[]
})

const selectedLabel = computed(() => {
  if (props.multiple) {
    // Comma-joined for button trigger
    return selectedOptions.value.map((f) => f.option.label).join(", ")
  }
  if (props.modelValue == null) return ""
  const found = flat.value.find((f) => f.option.value === props.modelValue)
  return found?.option.label ?? ""
})

const showEmpty = computed(
  () =>
    isSearchable.value &&
    isOpen.value &&
    !props.loading &&
    searchQuery.value.trim().length > 0 &&
    filteredFlat.value.length === 0,
)

const canClear = computed(() => {
  if (!props.clearable || props.disabled || props.loading) return false
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0
  }
  return props.modelValue != null
})

const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const listboxRef = ref<HTMLDivElement | null>(null)
const hiddenSelectRef = ref<HTMLSelectElement | null>(null)

const listboxStyle = ref<Record<string, string>>({})
const placement = ref<"top" | "bottom">("bottom")

// Forward listbox CSS vars from the root so they reach the teleported listbox,
// which no longer inherits from .vpick once it lives in <body>.
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
]

function forwardedVars(): Record<string, string> {
  const root = rootRef.value
  if (!root) return {}
  const cs = getComputedStyle(root)
  const out: Record<string, string> = {}
  for (const name of FORWARDED_VARS) {
    // Prefer inline style so unresolved var() references (e.g.
    // var(--vpick-trigger-width), which only resolves on the listbox) are
    // forwarded as-is. Fall back to computed style for class-based overrides.
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

async function updatePosition() {
  const trigger = triggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  // Searchable uses a larger offset so the 3px focus ring on the input has
  // breathing room from the dropdown.
  const offset = isSearchable.value ? 6 : 4
  const vpHeight = typeof window !== "undefined" ? window.innerHeight : 0
  // First paint: use a sensible default height; next frame remeasures actual.
  const initialHeight = listboxRef.value?.offsetHeight || 240
  const initial = computePosition(rect, initialHeight, vpHeight, offset)
  placement.value = initial.placement
  const forwarded = forwardedVars()

  const scrollX = typeof window !== "undefined" ? window.scrollX : 0
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0
  listboxStyle.value = {
    ...forwarded,
    position: "absolute",
    top: `${initial.top + scrollY}px`,
    left: `${initial.left + scrollX}px`,
    "--vpick-trigger-width": `${rect.width}px`,
  }
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
  listboxStyle.value = {
    ...forwarded,
    position: "absolute",
    top: `${measured.top + scrollY}px`,
    left: `${measured.left + scrollX}px`,
    "--vpick-trigger-width": `${rect.width}px`,
  }
}

function onReposition(e?: Event) {
  if (!isOpen.value) return
  // Ignore scroll events originating from the listbox's own scroll container.
  const target = e?.target
  if (target instanceof Node && listboxRef.value?.contains(target)) return
  updatePosition()
}

// Bubble value changes to parent form handlers.
// Vue's reactive :value binding sets the DOM property without firing a change
// event, dispatch one ourselves after the DOM has been updated.
watch(
  () => props.modelValue,
  () => {
    const select = hiddenSelectRef.value
    if (!select) return
    select.dispatchEvent(new Event("change", { bubbles: true }))
  },
  { flush: "post" },
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

function highlightDefault() {
  const list = filteredFlat.value
  if (props.multiple) {
    // In multi mode, always highlight first enabled option
    highlightedIndex.value = list.findIndex(
      (f) => !f.option.disabled && !f.groupDisabled,
    )
    return
  }
  const idx = list.findIndex(
    (f) => f.option.value === props.modelValue && !f.option.disabled,
  )
  highlightedIndex.value =
    idx >= 0
      ? idx
      : list.findIndex((f) => !f.option.disabled && !f.groupDisabled)
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
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function onSearchTriggerClick(e: MouseEvent) {
  if (props.disabled || props.loading) return
  // Mirror shadcn's InputGroupAddon: clicks on the dead area around the input
  // (e.g. the right-edge padding sliver) focus the input, which fires
  // @focus="open". Skip if the click already landed on the input or an
  // interactive child — they handle themselves.
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
  if (flatOption.option.disabled || flatOption.groupDisabled) return
  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? props.modelValue : []
    const val = flatOption.option.value
    if (selectedValues.value.has(val)) {
      emit(
        "update:modelValue",
        arr.filter((v) => v !== val),
      )
    } else {
      emit("update:modelValue", [...arr, val])
    }
    // Keep dropdown open in multi mode; clear search after each pick
    if (isSearchable.value) {
      searchQuery.value = ""
      isUserSearching.value = false
      emit("search", "")
    }
    return
  }
  emit("update:modelValue", flatOption.option.value)
  close()
}

function removeChip(value: OptionItem["value"]) {
  if (props.disabled) return
  const arr = Array.isArray(props.modelValue) ? props.modelValue : []
  emit(
    "update:modelValue",
    arr.filter((v) => v !== value),
  )
  focusTrigger()
}

function onClear() {
  if (!canClear.value) return
  emit("update:modelValue", props.multiple ? [] : undefined)
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
  // Re-highlight because filtered list changed
  nextTick(() => {
    const list = filteredFlat.value
    if (list.length === 0) {
      highlightedIndex.value = -1
      return
    }
    // If current highlight is out of range or now disabled, pick first enabled
    const cur = highlightedIndex.value
    const valid =
      cur >= 0 &&
      cur < list.length &&
      !list[cur].option.disabled &&
      !list[cur].groupDisabled
    if (!valid) {
      highlightedIndex.value = list.findIndex(
        (f) => !f.option.disabled && !f.groupDisabled,
      )
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
    .map((f, i) => (!f.option.disabled && !f.groupDisabled ? i : -1))
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
      // In search mode, space types a space in the input; in button mode it selects.
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
  }
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (rootRef.value?.contains(target)) return
  if (listboxRef.value?.contains(target)) return
  close()
}

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside)
  // render hidden form control only when trigger is inside a <form>
  isFormControl.value = !!rootRef.value?.closest("form")
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
        `vpick-trigger--${effectiveSize}`,
        { 'vpick-trigger--multi': multiple },
        { 'vpick-trigger--open': isOpen },
        { 'vpick-trigger--error': error },
        { 'vpick-trigger--loading': loading },
      ]"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
      :aria-activedescendant="
        isOpen && highlightedIndex >= 0 && filteredFlat[highlightedIndex]
          ? filteredFlat[highlightedIndex].id
          : undefined
      "
      :aria-controls="listboxId"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="error ? true : undefined"
      :aria-busy="loading || undefined"
      :disabled="disabled || loading"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span
        class="vpick-trigger-label"
        :class="{ 'vpick-trigger-placeholder': !selectedLabel }"
      >
        {{ selectedLabel || placeholder || "\u00A0" }}
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
        `vpick-trigger--${effectiveSize}`,
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
        <span class="vpick-chip-label">{{ fo.option.label }}</span>
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
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :aria-controls="listboxId"
        :aria-activedescendant="
          isOpen && highlightedIndex >= 0 && filteredFlat[highlightedIndex]
            ? filteredFlat[highlightedIndex].id
            : undefined
        "
        :aria-label="ariaLabel"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="error ? true : undefined"
        :aria-busy="loading || undefined"
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
      <span
        v-else
        class="vpick-trigger-icon vpick-trigger-icon--button"
        role="button"
        tabindex="-1"
        aria-hidden="true"
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
      </span>
    </div>

    <!-- Dropdown listbox (portaled to body by default) -->
    <Teleport :to="teleportTo ?? 'body'">
      <Transition name="vpick-dropdown" @after-leave="onAfterLeave">
        <div
          v-show="isOpen"
          :id="listboxId"
          ref="listboxRef"
          role="listbox"
          class="vpick-listbox"
          :aria-multiselectable="multiple || undefined"
          :style="listboxStyle"
          :data-placement="placement"
          @mousedown.prevent
        >
          <template v-for="(section, si) in sections" :key="'s' + si">
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
              <div
                v-for="item in section.items"
                :id="item.fo.id"
                :key="item.fo.id"
                role="option"
                :class="[
                  'vpick-option',
                  {
                    'vpick-option--highlighted':
                      item.flatIdx === highlightedIndex,
                    'vpick-option--selected': isSelected(item.fo.option.value),
                    'vpick-option--disabled':
                      item.fo.option.disabled || item.fo.groupDisabled,
                  },
                ]"
                :aria-selected="isSelected(item.fo.option.value)"
                :aria-disabled="
                  item.fo.option.disabled || item.fo.groupDisabled || undefined
                "
                @click="selectOption(item.fo)"
                @mouseenter="
                  !(item.fo.option.disabled || item.fo.groupDisabled) &&
                  (highlightedIndex = item.flatIdx)
                "
              >
                <span class="vpick-option-label">{{
                  item.fo.option.label
                }}</span>
                <span class="vpick-option-check" aria-hidden="true">
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
            </div>
          </template>
          <div v-if="showEmpty" class="vpick-empty">
            <slot name="empty" :query="searchQuery">{{ noResultsText }}</slot>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Visually hidden select for form submission + validation -->
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
      :value="multiple ? undefined : String(modelValue ?? '')"
    >
      <option v-if="!multiple" value="" />
      <option
        v-for="item in flat"
        :key="String(item.option.value)"
        :value="String(item.option.value)"
        :selected="multiple ? isSelected(item.option.value) : undefined"
      >
        {{ item.option.label }}
      </option>
    </select>
  </div>
</template>
