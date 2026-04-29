<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const selected = ref(null)

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
      { label: "Tablets", value: "tablets" },
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
  { label: "Books", value: "books" },
]
</script>

<template>
  <VPick
    v-model="selected"
    :options="options"
    clearable
    placeholder="Select a category"
    style="--vpick-width: 18rem"
  />
</template>
