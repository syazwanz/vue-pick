<script setup lang="ts">
import { ref } from "vue"
import { VPick } from "vue-pick"

const selected = ref<number | null>(null)
const users = [
  { id: 1, name: "Alice", inactive: false },
  { id: 2, name: "Bob", inactive: false },
  { id: 3, name: "Charlie", inactive: true },
]
</script>

<template>
  <VPick v-model="selected" :options="users" value-key="id" label-key="name" disabled-key="inactive"
    placeholder="Select user" style="--vpick-width: 14rem;" />
</template>
