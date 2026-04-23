<script setup lang="ts">
import { computed, ref } from "vue"
import Treeselect from "@riophae/vue-treeselect"
import VueSelect from "vue-select"
import { VPick, VPickNative } from "../../src/vue2"

import { timezones, options, sizeOptions, dataOptions } from "../data"

import "@riophae/vue-treeselect/dist/vue-treeselect.css"
import "vue-select/dist/vue-select.css"
import "../../src/style.css"
import "../style.css"

const selectedData = ref("countries")
const currentOptions = computed(() =>
  selectedData.value === "countries" ? options : timezones,
)

const currentTab = ref("vpick") // 'vpick' or 'native'
const selectedValue = ref(null)

const reduceOption = (opt: any) => opt.value

const treeSelectOptions = computed(() => {
  return currentOptions.value.map((opt: any) => ({
    id: opt.value,
    label: opt.label,
  }))
})

const propsConfig = ref({
  disabled: false,
  loading: false,
  required: false,
  searchable: true,
  clearable: true,
  error: "",
  size: "default" as "default" | "sm",
  rotateIcon: false,
  separators: false,
  bodyLock: null as boolean | null,
})

function toggleError(e: Event) {
  propsConfig.value.error = (e.target as HTMLInputElement).checked
    ? "Invalid selection"
    : ""
}
</script>

<template>
  <div class="sandbox-container">
    <h1 style="text-align: center">Vue 2.7 Sandbox</h1>
    <!-- Tab Switcher -->
    <div class="tabs" :data-active="currentTab">
      <div class="tab-slider"></div>
      <button
        :class="['tab-btn', { active: currentTab === 'vpick' }]"
        @click="currentTab = 'vpick'"
      >
        VPick
      </button>
      <button
        :class="['tab-btn', { active: currentTab === 'native' }]"
        @click="currentTab = 'native'"
      >
        VPick Native
      </button>
    </div>

    <!-- Controls Panel -->
    <div class="controls-panel">
      <div class="control-group">
        <label class="control-label"
          ><input v-model="propsConfig.disabled" type="checkbox" />
          Disabled</label
        >
        <label class="control-label"
          ><input v-model="propsConfig.loading" type="checkbox" />
          Loading</label
        >
        <label class="control-label"
          ><input v-model="propsConfig.required" type="checkbox" />
          Required</label
        >
        <label class="control-label">
          <input
            type="checkbox"
            :checked="!!propsConfig.error"
            @change="toggleError"
          />
          Error
        </label>
      </div>

      <div v-if="currentTab === 'vpick'" class="control-group">
        <label class="control-label"
          ><input v-model="propsConfig.searchable" type="checkbox" />
          Searchable</label
        >
        <label class="control-label"
          ><input v-model="propsConfig.clearable" type="checkbox" />
          Clearable</label
        >
        <label class="control-label"
          ><input v-model="propsConfig.rotateIcon" type="checkbox" /> Rotate
          Icon</label
        >
        <label class="control-label"
          ><input v-model="propsConfig.separators" type="checkbox" />
          Separators</label
        >
      </div>

      <div class="control-group">
        <label class="control-label">
          <span>Data:</span>
          <v-pick-native
            v-model="selectedData"
            :options="dataOptions"
            style="--vpick-width: 140px"
          />
        </label>
        <label class="control-label">
          <span>Size:</span>
          <v-pick-native
            v-model="propsConfig.size"
            :options="sizeOptions"
            style="--vpick-width: 120px"
          />
        </label>
      </div>
    </div>

    <!-- Component Display Area -->
    <div class="component-wrapper">
      <v-pick
        v-if="currentTab === 'vpick'"
        v-model="selectedValue"
        :options="currentOptions"
        v-bind="propsConfig"
        placeholder="Select an option"
        style="--vpick-width: 300px; --vpick-bg: white"
      />

      <v-pick-native
        v-else-if="currentTab === 'native'"
        v-model="selectedValue"
        :options="currentOptions"
        :disabled="propsConfig.disabled"
        :loading="propsConfig.loading"
        :required="propsConfig.required"
        :error="propsConfig.error"
        :size="propsConfig.size"
        placeholder="Select a country"
        style="--vpick-width: 300px; --vpick-bg: white"
      />
    </div>

    <div class="comparison-section">
      <h2 class="section-title">Vue-Treeselect</h2>
      <div class="component-wrapper">
        <treeselect
          v-model="selectedValue"
          :options="treeSelectOptions"
          :disabled="propsConfig.disabled"
          :searchable="propsConfig.searchable"
          :clearable="propsConfig.clearable"
          placeholder="Select an option"
          style="width: 300px"
        />
      </div>
    </div>

    <div class="comparison-section" style="margin-top: 40px">
      <h2 class="section-title">Vue-Select</h2>
      <div class="component-wrapper">
        <vue-select
          v-model="selectedValue"
          :options="currentOptions"
          :reduce="reduceOption"
          :disabled="propsConfig.disabled"
          :searchable="propsConfig.searchable"
          :clearable="propsConfig.clearable"
          placeholder="Select an option"
          style="width: 300px"
        />
      </div>
    </div>

    <div class="comparison-section" style="margin-top: 40px">
      <h2 class="section-title">Vue-Select</h2>
      <div class="component-wrapper">
        <v-pick
          v-if="currentTab === 'vpick'"
          v-model="selectedValue"
          :options="currentOptions"
          v-bind="propsConfig"
          placeholder="Select an option"
          style="--vpick-width: 300px; --vpick-bg: white"
        />

        <v-pick-native
          v-else-if="currentTab === 'native'"
          v-model="selectedValue"
          :options="currentOptions"
          :disabled="propsConfig.disabled"
          :loading="propsConfig.loading"
          :required="propsConfig.required"
          :error="propsConfig.error"
          :size="propsConfig.size"
          placeholder="Select a country"
          style="--vpick-width: 300px; --vpick-bg: white"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comparison-section {
  width: 100%;
  max-width: 500px;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
