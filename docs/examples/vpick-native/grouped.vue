<script setup lang="ts">
import { ref } from "vue"
import { VPickNative } from "vue-pick"

const selected = ref<string | null>(null)
const options = [
  {
    label: "Engineering",
    options: [
      { label: "Frontend", value: "frontend" },
      { label: "Backend", value: "backend" },
    ],
  },
  {
    label: "Sales",
    options: [
      { label: "Sales Rep", value: "sales-rep" },
      { label: "Account Manager", value: "account-manager", disabled: true },
    ],
  },
]
</script>

<template>
  <VPickNative
    v-model="selected"
    :options="options"
    placeholder="Select a role"
  />
</template>
