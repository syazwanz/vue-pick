<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const selected = ref<string[]>([])
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Review", value: "review" },
  { label: "Done", value: "done" },
  { label: "Archived", value: "archived" },
]
</script>

<template>
  <VPick
    v-model="selected"
    :options="options"
    multiple
    clearable
    placeholder="Select statuses"
    style="--vpick-width: 18rem"
  />
</template>
