<script lang="ts">
export default { name: "VPickNative" }
</script>

<script setup lang="ts">
import { computed } from "vue"
import {
  type OptionItem,
  isOptionGroup,
  normalizeOptions,
} from "../core"

const props = defineProps<{
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
  ariaLabel?: string
  ariaDescribedby?: string
  labelKey?: string
  valueKey?: string
  disabledKey?: string
  groupOptionsKey?: string
}>()

const emit = defineEmits<{
  (e: "input", value: OptionItem["value"]): void
}>()

const normalized = computed(() =>
  normalizeOptions(props.options, {
    label: props.labelKey,
    value: props.valueKey,
    disabled: props.disabledKey,
    groupOptions: props.groupOptionsKey,
  }),
)

function findOption(val: string): OptionItem | undefined {
  for (const item of normalized.value) {
    if (isOptionGroup(item)) {
      const found = item.options.find((o) => String(o.value) === val)
      if (found) return found
    } else {
      if (String(item.value) === val) return item
    }
  }
}

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const option = findOption(target.value)
  if (option) {
    emit("input", option.value)
  }
}
</script>

<template>
  <div class="vpick-native-wrapper" :class="{
    'vpick-native--disabled': disabled,
    'vpick-native--loading': loading,
  }">
    <select :id="id" :name="name" class="vpick-native" :class="[
      `vpick-native--${size ?? 'default'}`,
      { 'vpick-native--error': error },
    ]" :value="String(value ?? '')" :disabled="disabled || loading" :required="required"
      :aria-invalid="error ? true : undefined" :aria-busy="loading || undefined" :aria-describedby="ariaDescribedby"
      :aria-label="ariaLabel" @change="onChange">
      <option v-if="placeholder" value="" disabled selected>
        {{ placeholder }}
      </option>
      <template v-for="item in normalized">
        <optgroup v-if="isOptionGroup(item)" :key="'group-' + item.label" :label="item.label" :disabled="item.disabled"
          class="vpick-native-optgroup">
          <option v-for="option in item.options" :key="String(option.value)" :value="String(option.value)"
            :disabled="option.disabled" class="vpick-native-option">
            {{ option.label }}
          </option>
        </optgroup>
        <option v-else :key="String(item.value)" :value="String(item.value)" :disabled="item.disabled"
          class="vpick-native-option">
          {{ item.label }}
        </option>
      </template>
    </select>
    <span v-if="loading" class="vpick-native-icon vpick-native-spinner" aria-hidden="true">
      <slot name="loading">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </slot>
    </span>
    <span v-else class="vpick-native-icon" aria-hidden="true">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </slot>
    </span>
  </div>
</template>
