<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const selected = ref<string | null>(null)
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <VPick
    v-model="selected"
    :options="options"
    loading
    placeholder="Loading..."
    style="--vpick-width: 14rem"
  />
</template>
