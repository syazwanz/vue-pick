<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const nothing = ref(null)
const noMatch = ref(null)
const slotted = ref(null)

const options = [
  { label: "Todo", value: "todo" },
  { label: "Done", value: "done" },
]
</script>

<template>
  <div class="row">
    <label>
      <span>Empty <code>options</code></span>
      <VPick
        v-model="nothing"
        :options="[]"
        no-options-text="Nothing to pick from yet"
        placeholder="Open me"
        style="--vpick-width: 14rem"
      />
    </label>

    <label>
      <span>Search with no match</span>
      <VPick
        v-model="noMatch"
        :options="options"
        searchable
        no-results-text="No match for that"
        placeholder='Type "xyz"'
        style="--vpick-width: 14rem"
      />
    </label>

    <label>
      <span>The <code>empty</code> slot</span>
      <VPick
        v-model="slotted"
        :options="options"
        searchable
        placeholder='Type "xyz"'
        style="--vpick-width: 14rem"
      >
        <template #empty="{ query }">
          <strong>{{ query }}</strong> is not a status yet.
        </template>
      </VPick>
    </label>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

span {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
</style>
