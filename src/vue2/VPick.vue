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
  type OptionOrGroup,
  type FlatOption,
  flattenOptions,
  generateId,
} from "../core"

const props = defineProps<{
  value?: OptionItem["value"]
  options: OptionOrGroup[]
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
}>()

const emit = defineEmits<{
  (e: "input", value: OptionItem["value"]): void
}>()

const isOpen = ref(false)
const highlightedIndex = ref(-1)
const isFormControl = ref(true)

const instanceId = props.id ?? generateId()
const listboxId = `${instanceId}-listbox`

const flat = computed<FlatOption[]>(() =>
  flattenOptions(props.options, instanceId),
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
const hiddenSelectRef = ref<HTMLSelectElement | null>(null)

function getRootEl(): HTMLElement | null {
  return (
    rootRef.value ??
    (instance?.proxy?.$el as HTMLElement | undefined) ??
    null
  )
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

function open() {
  if (props.disabled || props.loading) return
  isOpen.value = true
  highlightDefault()
}

function close() {
  isOpen.value = false
  highlightedIndex.value = -1
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
  close()
}

onMounted(async () => {
  document.addEventListener("mousedown", onClickOutside)
  await nextTick()
  isFormControl.value = !!getRootEl()?.closest("form")
})

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onClickOutside)
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

    <!-- Dropdown listbox -->
    <div v-show="isOpen" :id="listboxId" role="listbox" class="vpick-listbox" @mousedown.prevent>
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
