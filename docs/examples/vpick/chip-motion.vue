<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const animated = ref<string[]>(["todo", "review"])
const instant = ref<string[]>(["todo", "review"])
const options = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Review", value: "review" },
  { label: "Done", value: "done" },
  { label: "Archived", value: "archived" },
]
</script>

<template>
  <div class="chip-motion">
    <label>
      <span>Default</span>
      <VPick
        v-model="animated"
        :options="options"
        multiple
        clearable
        placeholder="Select statuses"
        style="--vpick-width: 18rem"
      />
    </label>

    <label>
      <span>Motion off</span>
      <VPick
        v-model="instant"
        :options="options"
        multiple
        clearable
        placeholder="Select statuses"
        style="--vpick-width: 18rem; --vpick-chip-transition-duration: 0s"
      />
    </label>
  </div>
</template>

<style scoped>
.chip-motion {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.chip-motion label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.chip-motion span {
  font-size: 0.75rem;
  opacity: 0.6;
}
</style>
