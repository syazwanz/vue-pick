<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const ids = ref(["apple"])
const objects = ref([{ id: "apple" }])

const fruit = [
  { id: "apple", name: "Apple", price: 3 },
  { id: "banana", name: "Banana", price: 2 },
  { id: "cherry", name: "Cherry", price: 6 },
]
</script>

<template>
  <div class="row">
    <label>
      <span>Default, <code>valueFormat="id"</code></span>
      <VPick
        v-model="ids"
        :options="fruit"
        label-key="name"
        value-key="id"
        multiple
        style="--vpick-width: 15rem"
      />
      <pre>{{ JSON.stringify(ids) }}</pre>
    </label>

    <label>
      <span><code>valueFormat="object"</code></span>
      <VPick
        v-model="objects"
        :options="fruit"
        label-key="name"
        value-key="id"
        value-format="object"
        multiple
        style="--vpick-width: 15rem"
      />
      <pre>{{ JSON.stringify(objects, null, 1) }}</pre>
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

pre {
  margin: 0;
  padding: 0.5rem 0.625rem;
  max-width: 15rem;
  font-size: 0.6875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 0.375rem;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}
</style>
