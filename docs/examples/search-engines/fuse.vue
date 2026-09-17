<script setup lang="ts">
import { ref } from "vue"
import Fuse from "fuse.js"
import { VPick } from "vue-pick"

type Person = { id: number; name: string; email: string }

const people: Person[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@analytical.org" },
  { id: 2, name: "Alan Turing", email: "alan@bletchley.uk" },
  { id: 3, name: "Grace Hopper", email: "grace@navy.mil" },
  { id: 4, name: "Katherine Johnson", email: "katherine@orbit.gov" },
  { id: 5, name: "Linus Torvalds", email: "linus@kernel.org" },
  { id: 6, name: "Margaret Hamilton", email: "margaret@apollo.space" },
  { id: 7, name: "Tim Berners-Lee", email: "tim@web.org" },
  { id: 8, name: "Barbara Liskov", email: "barbara@substitution.edu" },
]

const fuse = new Fuse(people, { keys: ["name", "email"], threshold: 0.4 })

function fetchOptions(query: string) {
  return fuse.search(query).map((result) => result.item)
}

const selected = ref<number[]>([])
</script>

<template>
  <div class="stack">
    <VPick
      v-model="selected"
      :options="people"
      :fetch-options="fetchOptions"
      :search-debounce="0"
      label-key="name"
      value-key="id"
      multiple
      placeholder='Try "lovlace" or "kernel"'
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
