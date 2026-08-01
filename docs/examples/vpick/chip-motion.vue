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
    <div class="pane">
      <!-- Pair the label by `for` and `id`. Wrapping the component in a label
           instead would bind it to the first chip's remove button. -->
      <label for="chip-motion-default">Default</label>
      <VPick
        id="chip-motion-default"
        v-model="animated"
        :options="options"
        multiple
        clearable
        placeholder="Select statuses"
        style="--vpick-width: 18rem"
      />
    </div>

    <div class="pane">
      <label for="chip-motion-instant">Motion off</label>
      <VPick
        id="chip-motion-instant"
        v-model="instant"
        :options="options"
        multiple
        clearable
        placeholder="Select statuses"
        :animate="false"
        style="--vpick-width: 18rem"
      />
    </div>
  </div>
</template>

<style scoped>
.chip-motion {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.chip-motion .pane {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  align-items: flex-start;
}

.chip-motion label {
  font-size: 0.75rem;
  opacity: 0.6;
  cursor: pointer;
}
</style>
