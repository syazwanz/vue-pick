<script setup lang="ts">
import { ref } from "vue"
import { VPickNative } from "vue-pick"

const selectedA = ref<string | null>(null)
const selectedB = ref<string | null>(null)
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <div style="display: flex; gap: 1rem; align-items: center">
    <VPickNative
      v-model="selectedA"
      :options="options"
      size="sm"
      placeholder="Small"
    />
    <VPickNative v-model="selectedB" :options="options" placeholder="Default" />
  </div>
</template>
