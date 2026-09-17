<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

type Category = {
  label: string
  value: string
  children?: Category[] | null
}

const selected = ref<string[]>([])

// `children: null` marks a branch whose children are fetched when it opens.
const options: Category[] = [
  { label: "Electronics", value: "electronics", children: null },
  { label: "Clothing", value: "clothing", children: null },
  { label: "Gift card", value: "gift-card" },
]

// Stands in for a request to your API.
const catalog: Record<string, Category[]> = {
  electronics: [
    { label: "Phones", value: "phones" },
    { label: "Laptops", value: "laptops", children: null },
  ],
  laptops: [
    { label: "Gaming laptop", value: "gaming-laptop" },
    { label: "Business laptop", value: "business-laptop" },
  ],
  clothing: [
    { label: "Shirts", value: "shirts" },
    { label: "Pants", value: "pants" },
  ],
}

function loadChildren(option: unknown): Promise<Category[]> {
  const { value } = option as Category
  return new Promise((resolve) =>
    setTimeout(() => resolve(catalog[value] ?? []), 800),
  )
}
</script>

<template>
  <div class="stack">
    <VPick
      v-model="selected"
      :options="options"
      :load-children="loadChildren"
      multiple
      placeholder="Select categories"
      style="--vpick-width: 20rem"
    />
    <pre>{{ JSON.stringify(selected) }}</pre>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
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
