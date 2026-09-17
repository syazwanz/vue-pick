<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

type City = { id: string; name: string; country: string }

// Stands in for your API. It matches on its own terms, takes a moment, and
// stops when the request is aborted.
const cities: City[] = [
  { id: "kl", name: "Kuala Lumpur", country: "Malaysia" },
  { id: "sg", name: "Singapore", country: "Singapore" },
  { id: "tyo", name: "Tokyo", country: "Japan" },
  { id: "par", name: "Paris", country: "France" },
  { id: "ber", name: "Berlin", country: "Germany" },
  { id: "mex", name: "Mexico City", country: "Mexico" },
  { id: "sao", name: "São Paulo", country: "Brazil" },
  { id: "akl", name: "Auckland", country: "New Zealand" },
]

function fakeApi(query: string, signal?: AbortSignal): Promise<City[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      resolve(
        cities.filter((c) =>
          `${c.name} ${c.country}`.toLowerCase().includes(q),
        ),
      )
    }, 600)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }))
    })
  })
}

function fetchOptions(query: string, { signal }: { signal?: AbortSignal }) {
  return fakeApi(query, signal)
}

const selected = ref<string | null>(null)
</script>

<template>
  <div class="stack">
    <VPick
      v-model="selected"
      :options="[]"
      :fetch-options="fetchOptions"
      label-key="name"
      value-key="id"
      placeholder="Search cities or countries"
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
