<script setup lang="ts">
import { ref } from "vue"
import { Document } from "flexsearch"
import { VPick } from "vue-pick"

type Product = { id: number; title: string; description: string }

const products: Product[] = [
  { id: 1, title: "Trail shoes", description: "For running on rough ground" },
  { id: 2, title: "Road shoes", description: "Light, for runners on tarmac" },
  { id: 3, title: "Rain jacket", description: "Keeps you dry on long walks" },
  { id: 4, title: "Wool socks", description: "Warm on cold hikes" },
  { id: 5, title: "Head torch", description: "For running after dark" },
  { id: 6, title: "Water bottle", description: "Holds a litre on the trail" },
]

const index = new Document<Product>({
  document: { id: "id", index: ["title", "description"], store: true },
  tokenize: "forward",
})
for (const product of products) index.add(product)

function fetchOptions(query: string) {
  return index
    .search(query, { merge: true, enrich: true, suggest: true })
    .map((result) => result.doc)
}

const selected = ref<number | null>(null)
</script>

<template>
  <div class="stack">
    <VPick
      v-model="selected"
      :options="products"
      :fetch-options="fetchOptions"
      :search-debounce="0"
      label-key="title"
      value-key="id"
      placeholder='Try "run" or "trail"'
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
