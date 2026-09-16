<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

type Mode = "ORDER_SELECTED" | "INDEX" | "LEVEL"

const mode = ref<Mode>("ORDER_SELECTED")
const selected = ref<string[]>([])

const modes = [
  { label: "ORDER_SELECTED", value: "ORDER_SELECTED" },
  { label: "INDEX", value: "INDEX" },
  { label: "LEVEL", value: "LEVEL" },
]

const options = [
  {
    label: "Electronics",
    value: "electronics",
    children: [
      { label: "Phones", value: "phones" },
      { label: "Laptops", value: "laptops" },
    ],
  },
  {
    label: "Clothing",
    value: "clothing",
    children: [
      { label: "Shirts", value: "shirts" },
      { label: "Pants", value: "pants" },
    ],
  },
]
</script>

<template>
  <div class="stack">
    <label>
      <span>sortValueBy</span>
      <VPick v-model="mode" :options="modes" style="--vpick-width: 15rem" />
    </label>

    <label>
      <span>Pick a few out of order, bottom-up</span>
      <VPick
        v-model="selected"
        :options="options"
        :sort-value-by="mode"
        :cascade="false"
        multiple
        placeholder="Select categories"
        style="--vpick-width: 20rem"
      />
    </label>

    <pre>{{ JSON.stringify(selected) }}</pre>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

span {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

pre {
  margin: 0;
  padding: 0.5rem 0.625rem;
  max-width: 20rem;
  font-size: 0.6875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 0.375rem;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}
</style>
