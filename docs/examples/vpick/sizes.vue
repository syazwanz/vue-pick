<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const selectedA = ref<string | null>(null)
const selectedB = ref<string | null>(null)
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <div style="display: flex; gap: 1rem; align-items: start;">
    <VPick v-model="selectedA" :options="options" size="sm" placeholder="Small" />
    <VPick v-model="selectedB" :options="options" placeholder="Default" />
  </div>
</template>
