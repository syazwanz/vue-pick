<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

type Country = { label: string; value: string }

const selected = ref<string[]>([])

// Stands in for your API. It matches on its own terms and takes a moment.
const countries: Country[] = [
  { label: "Brazil", value: "br" },
  { label: "Côte d'Ivoire", value: "ci" },
  { label: "France", value: "fr" },
  { label: "Germany", value: "de" },
  { label: "Japan", value: "jp" },
  { label: "Malaysia", value: "my" },
  { label: "México", value: "mx" },
  { label: "New Zealand", value: "nz" },
  { label: "Singapore", value: "sg" },
  { label: "Spain", value: "es" },
]

function fetchOptions(query: string): Promise<Country[]> {
  const q = query.toLowerCase()
  return new Promise((resolve) =>
    setTimeout(
      () => resolve(countries.filter((c) => c.label.toLowerCase().includes(q))),
      600,
    ),
  )
}
</script>

<template>
  <div class="stack">
    <VPick
      v-model="selected"
      :options="[]"
      :fetch-options="fetchOptions"
      multiple
      placeholder="Search countries"
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
