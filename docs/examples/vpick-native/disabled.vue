<script setup lang="ts">
import { ref } from "vue"
import { VPickNative } from "vue-pick"

const selected = ref<string | null>("done")
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <VPickNative v-model="selected" :options="options" disabled />
</template>
