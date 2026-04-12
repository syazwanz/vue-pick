<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const selected = ref<string | null>(null)
const options = [
  {
    label: "Status",
    options: [
      { label: "Todo", value: "todo" },
      { label: "In Progress", value: "in-progress" },
    ],
  },
  {
    label: "Archived",
    options: [
      { label: "Done", value: "done" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
]
</script>

<template>
  <VPick v-model="selected" :options="options" placeholder="Select status" separators rotate-icon />
</template>
