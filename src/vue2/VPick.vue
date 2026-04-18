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
} from "vue"
import {
  type OptionItem,
  type FlatOption,
  flattenOptions,
  generateId,
  normalizeOptions,
  computePosition,
  lockBodyScroll,
  unlockBodyScroll,
} from "../core"

const props = withDefaults(
  defineProps<{
    value?: OptionItem["value"]
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
    bodyLock: true,
  },
)

const emit = defineEmits<{
  (e: "input", value: OptionItem["value"]): void
}>()

const isOpen = ref(false)
const highlightedIndex = ref(-1)
const isFormControl = ref(true)

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

interface Section {
  label?: string
  labelId?: string
  items: { fo: FlatOption; flatIdx: number }[]
}

const sections = computed<Section[]>(() => {
  const result: Section[] = []
  let current: Section | null = null
  flat.value.forEach((fo, flatIdx) => {
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

const selectedLabel = computed(() => {
  if (props.value == null) return ""
  const found = flat.value.find((f) => f.option.value === props.value)
  return found?.option.label ?? ""
})

const instance = getCurrentInstance()
const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listboxRef = ref<HTMLDivElement | null>(null)
const hiddenSelectRef = ref<HTMLSelectElement | null>(null)

const listboxStyle = ref<Record<string, string>>({})

function getRootEl(): HTMLElement | null {
  return (
    rootRef.value ??
    (instance?.proxy?.$el as HTMLElement | undefined) ??
    null
  )
}

// Forward listbox CSS vars from the root so they reach the portaled listbox,
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

async function updatePosition() {
  const trigger = triggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  const initialHeight = listboxRef.value?.offsetHeight || 240
  const initial = computePosition(rect, initialHeight)
  const forwarded = forwardedVars()
  listboxStyle.value = {
    ...forwarded,
    position: "fixed",
    top: `${initial.top}px`,
    left: `${initial.left}px`,
    "--vpick-trigger-width": `${rect.width}px`,
  }
  await nextTick()
  const el = listboxRef.value
  if (!el) return
  const measured = computePosition(
    trigger.getBoundingClientRect(),
    el.offsetHeight,
  )
  listboxStyle.value = {
    ...forwarded,
    position: "fixed",
    top: `${measured.top}px`,
    left: `${measured.left}px`,
    "--vpick-trigger-width": `${rect.width}px`,
  }
}

function onReposition(e?: Event) {
  if (!isOpen.value) return
  const target = e?.target
  if (target instanceof Node && listboxRef.value?.contains(target)) return
  updatePosition()
}

watch(
  () => props.value,
  async () => {
    await nextTick()
    const select = hiddenSelectRef.value
    if (!select) return
    select.dispatchEvent(new Event("change", { bubbles: true }))
  },
)

function highlightDefault() {
  const list = flat.value
  const idx = list.findIndex(
    (f) => f.option.value === props.value && !f.option.disabled,
  )
  highlightedIndex.value =
    idx >= 0
      ? idx
      : list.findIndex((f) => !f.option.disabled && !f.groupDisabled)
}

let scrollLocked = false

function open() {
  if (props.disabled || props.loading) return
  isOpen.value = true
  highlightDefault()
  if (props.bodyLock) {
    lockBodyScroll()
    scrollLocked = true
  }
  nextTick(updatePosition)
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  highlightedIndex.value = -1
  if (scrollLocked) {
    unlockBodyScroll()
    scrollLocked = false
  }
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function selectOption(flatOption: FlatOption) {
  if (flatOption.option.disabled || flatOption.groupDisabled) return
  emit("input", flatOption.option.value)
  close()
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault()
      open()
    }
    return
  }

  const list = flat.value
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
    case "Enter":
    case " ": {
      e.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectOption(list[highlightedIndex.value])
      }
      break
    }
    case "Escape": {
      e.preventDefault()
      close()
      triggerRef.value?.focus()
      break
    }
  }
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (getRootEl()?.contains(target)) return
  if (listboxRef.value?.contains(target)) return
  close()
}

onMounted(async () => {
  document.addEventListener("mousedown", onClickOutside)
  window.addEventListener("scroll", onReposition, true)
  window.addEventListener("resize", onReposition)
  await nextTick()
  isFormControl.value = !!getRootEl()?.closest("form")
  // Move the listbox DOM node to the teleport target. Vue's vnode keeps the
  // reference, so patching continues to work from the new location.
  if (listboxRef.value) {
    resolveTeleportTarget().appendChild(listboxRef.value)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onClickOutside)
  window.removeEventListener("scroll", onReposition, true)
  window.removeEventListener("resize", onReposition)
  if (scrollLocked) {
    unlockBodyScroll()
    scrollLocked = false
  }
  // Detach the portaled listbox so Vue doesn't leave orphan nodes in <body>.
  if (listboxRef.value?.parentNode) {
    listboxRef.value.parentNode.removeChild(listboxRef.value)
  }
})
</script>

<template>
  <div ref="rootRef" :class="['vpick', { 'vpick--rotate-icon': rotateIcon }]" role="none">
    <!-- Button trigger -->
    <button :id="instanceId" ref="triggerRef" type="button" role="combobox" :class="[
      'vpick-trigger',
      `vpick-trigger--${size ?? 'default'}`,
      { 'vpick-trigger--open': isOpen },
      { 'vpick-trigger--error': error },
      { 'vpick-trigger--loading': loading },
    ]" :aria-expanded="isOpen ? 'true' : 'false'" :aria-haspopup="'listbox'" :aria-activedescendant="isOpen && highlightedIndex >= 0
      ? flat[highlightedIndex].id
      : undefined
      " :aria-controls="listboxId" :aria-label="ariaLabel" :aria-describedby="ariaDescribedby"
      :aria-invalid="error ? 'true' : undefined" :aria-busy="loading ? 'true' : undefined"
      :disabled="disabled || loading" @click="toggle" @keydown="onKeydown">
      <span class="vpick-trigger-label" :class="{ 'vpick-trigger-placeholder': !selectedLabel }">
        {{ selectedLabel || placeholder || '\u00A0' }}
      </span>
      <span v-if="loading" class="vpick-trigger-icon vpick-trigger-spinner" aria-hidden="true">
        <slot name="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </slot>
      </span>
      <span v-else class="vpick-trigger-icon" aria-hidden="true">
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </slot>
      </span>
    </button>

    <!-- Dropdown listbox (portaled to body via DOM move on mount) -->
    <div v-show="isOpen" :id="listboxId" ref="listboxRef" role="listbox" class="vpick-listbox" :style="listboxStyle"
      @mousedown.prevent>
      <div v-for="(section, si) in sections" :key="'s' + si">
        <div v-if="separators && si > 0" role="separator" class="vpick-separator" aria-hidden="true" />
        <div class="vpick-group" :role="section.label ? 'group' : undefined" :aria-labelledby="section.labelId">
          <div v-if="section.label" :id="section.labelId" class="vpick-group-label">{{ section.label }}</div>
          <div v-for="item in section.items" :id="item.fo.id" :key="item.fo.id" role="option" :class="[
            'vpick-option',
            {
              'vpick-option--highlighted': item.flatIdx === highlightedIndex,
              'vpick-option--selected': item.fo.option.value === value,
              'vpick-option--disabled':
                item.fo.option.disabled || item.fo.groupDisabled,
            },
          ]" :aria-selected="item.fo.option.value === value ? 'true' : 'false'" :aria-disabled="item.fo.option.disabled || item.fo.groupDisabled ? 'true' : undefined
            " @click="selectOption(item.fo)" @mouseenter="
              !(item.fo.option.disabled || item.fo.groupDisabled) &&
              (highlightedIndex = item.flatIdx)
              ">
            <span class="vpick-option-label">{{ item.fo.option.label }}</span>
            <span class="vpick-option-check" aria-hidden="true">
              <svg v-if="item.fo.option.value === value" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Visually hidden select for form submission + validation -->
    <select v-if="isFormControl" ref="hiddenSelectRef" :name="name" :required="required" :disabled="disabled"
      tabindex="-1" aria-hidden="true" class="vpick-hidden-select" :value="String(value ?? '')">
      <option value="" />
      <option v-for="item in flat" :key="String(item.option.value)" :value="String(item.option.value)">
        {{ item.option.label }}
      </option>
    </select>
  </div>
</template>
