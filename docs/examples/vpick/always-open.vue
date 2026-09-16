<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const selected = ref<string[]>(["in-progress"])

const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Review", value: "review" },
  { label: "Done", value: "done" },
  { label: "Archived", value: "archived" },
]
</script>

<template>
  <div class="panel">
    <p class="panel__title">Filter by status</p>
    <VPick
      v-model="selected"
      :options="options"
      always-open
      multiple
      searchable
      placeholder="Search statuses"
      style="--vpick-width: 100%"
    />
  </div>
</template>

<style scoped>
/* A stand-in for the filter panel or popover this usually lives in. */
.panel {
  width: 17rem;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background-color: var(--vp-c-bg);
}

.panel__title {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
</style>
