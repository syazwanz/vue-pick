<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const collapsed = ref(null)
const expanded = ref(null)
const leavesOnly = ref<string[]>([])

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
          { label: "Gaming", value: "gaming" },
          { label: "Business", value: "business" },
        ],
      },
    ],
  },
  {
    label: "Clothing",
    value: "clothing",
    children: [
      { label: "Shirts", value: "shirts" },
      { label: "Pants", value: "pants" },
    ],
  },
]
</script>

<template>
  <div class="row">
    <label>
      <span>No expand level</span>
      <VPick
        v-model="collapsed"
        :options="options"
        placeholder="All collapsed"
        style="--vpick-width: 13rem"
      />
    </label>

    <label>
      <span>defaultExpandLevel 1</span>
      <VPick
        v-model="expanded"
        :options="options"
        :default-expand-level="1"
        placeholder="Top level open"
        style="--vpick-width: 13rem"
      />
    </label>

    <label>
      <span>disableBranchNodes</span>
      <VPick
        v-model="leavesOnly"
        :options="options"
        :default-expand-level="1"
        disable-branch-nodes
        multiple
        placeholder="Leaves only"
        style="--vpick-width: 13rem"
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
