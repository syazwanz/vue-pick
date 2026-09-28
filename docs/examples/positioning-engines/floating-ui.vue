<script setup lang="ts">
import { ref } from "vue"
import * as FloatingUI from "@floating-ui/dom"
import { VPick } from "vue-pick"

const status = ref<string | null>(null)
const sort = ref<string | null>(null)

const statuses = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Waiting on someone else", value: "waiting" },
  { label: "Done", value: "done" },
]

const sorts = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Recently updated, then by title", value: "updated" },
]
</script>

<template>
  <div class="toolbar">
    <VPick
      v-model="status"
      :options="statuses"
      :floating-ui="FloatingUI"
      placeholder="Status"
      style="--vpick-width: 8rem"
    />
    <VPick
      v-model="sort"
      :options="sorts"
      :floating-ui="FloatingUI"
      align="end"
      placeholder="Sort"
      style="--vpick-width: 7rem"
    />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}
</style>
