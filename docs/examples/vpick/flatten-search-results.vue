<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const nested = ref(null)
const flat = ref(null)

const options = [
  {
    label: "Electronics",
    value: "electronics",
    children: [
      { label: "Phones", value: "phones" },
      {
        label: "Laptops",
        value: "laptops",
        children: [
          { label: "Gaming laptop", value: "gaming-laptop" },
          { label: "Business laptop", value: "business-laptop" },
        ],
      },
    ],
  },
  {
    label: "Clothing",
    value: "clothing",
    children: [
      { label: "Gaming shirts", value: "gaming-shirts" },
      { label: "Pants", value: "pants" },
    ],
  },
]
</script>

<template>
  <div class="row">
    <label>
      <span>Nested (default)</span>
      <VPick
        v-model="nested"
        :options="options"
        searchable
        placeholder='Search "gaming"'
        style="--vpick-width: 15rem"
      />
    </label>

    <label>
      <span>Flattened</span>
      <VPick
        v-model="flat"
        :options="options"
        searchable
        flatten-search-results
        placeholder='Search "gaming"'
        style="--vpick-width: 15rem"
      />
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
