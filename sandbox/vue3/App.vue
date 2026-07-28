<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { VPick, VPickNative } from "../../src/vue3"

import { timezones, options, dataOptions, treeOptions } from "../data"

import "../../src/style.css"
import "../style.css"

const selectedData = ref("countries")
const currentOptions = computed(() =>
  selectedData.value === "countries" ? options : timezones,
)

const currentTab = ref("vpick") // 'vpick' or 'native'
const selectedValue = ref<unknown>(null)

const treeValue = ref<unknown>(null)
const treeMultiValue = ref<unknown[]>([])
const treeSearchable = ref(false)
const treeClearable = ref(true)
const treeDisableBranches = ref(false)
const treeDefaultExpandLevel = ref(0)
const treeCascade = ref(true)
const treeValueConsistsOf = ref<
  "LEAF_PRIORITY" | "ALL" | "BRANCH_PRIORITY" | "ALL_WITH_INDETERMINATE"
>("LEAF_PRIORITY")

const propsConfig = ref({
  disabled: false,
  loading: false,
  required: false,
  searchable: true,
  clearable: true,
  error: "",
  rotateIcon: false,
  separators: false,
  bodyLock: undefined as boolean | undefined,
  multiple: false,
})

// Reset value shape when toggling multiple mode
watch(
  () => propsConfig.value.multiple,
  (isMulti) => {
    selectedValue.value = isMulti ? [] : null
  },
)

// VPickNative doesn't support multiple — drop the flag when switching tabs so
// selectedValue stays in single-value shape.
watch(currentTab, (tab) => {
  if (tab === "native") propsConfig.value.multiple = false
})

function toggleError(e: Event) {
  propsConfig.value.error = (e.target as HTMLInputElement).checked
    ? "Invalid selection"
    : ""
}
</script>

<template>
  <div class="sandbox-container">
    <h1 style="text-align: center">Vue 3 Sandbox</h1>
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
        <label class="control-label"
          ><input v-model="propsConfig.multiple" type="checkbox" />
          Multiple</label
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
        placeholder="Select a country"
        style="--vpick-width: 300px; --vpick-bg: white"
      />
    </div>

    <!-- Tree Select Demo -->
    <div class="sandbox-section">
      <h2 style="text-align: center; margin-bottom: 1rem">Tree Select</h2>
      <div class="controls">
        <label class="control-label">
          <input v-model="treeSearchable" type="checkbox" />
          <span>Searchable</span>
        </label>
        <label class="control-label">
          <input v-model="treeClearable" type="checkbox" />
          <span>Clearable</span>
        </label>
        <label class="control-label">
          <input v-model="treeDisableBranches" type="checkbox" />
          <span>Disable branch nodes</span>
        </label>
        <label class="control-label">
          <span>Default expand level:</span>
          <input
            v-model.number="treeDefaultExpandLevel"
            type="number"
            min="0"
            max="5"
            style="width: 3rem; margin-left: 0.25rem"
          />
        </label>
        <label class="control-label">
          <input v-model="treeCascade" type="checkbox" />
          <span>Cascade</span>
        </label>
        <label class="control-label">
          <span>valueConsistsOf:</span>
          <v-pick-native
            v-model="treeValueConsistsOf"
            :options="[
              { label: 'LEAF_PRIORITY', value: 'LEAF_PRIORITY' },
              { label: 'ALL', value: 'ALL' },
              { label: 'BRANCH_PRIORITY', value: 'BRANCH_PRIORITY' },
              {
                label: 'ALL_WITH_INDETERMINATE',
                value: 'ALL_WITH_INDETERMINATE',
              },
            ]"
            style="--vpick-width: 200px; margin-left: 0.25rem"
          />
        </label>
      </div>
      <div
        style="
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1rem;
        "
      >
        <div>
          <div
            style="
              text-align: center;
              font-size: 0.75rem;
              color: #737373;
              margin-bottom: 0.5rem;
            "
          >
            Single
          </div>
          <v-pick
            v-model="treeValue"
            :options="treeOptions"
            :searchable="treeSearchable"
            :clearable="treeClearable"
            :disable-branch-nodes="treeDisableBranches"
            :default-expand-level="treeDefaultExpandLevel || undefined"
            placeholder="Select a category"
            style="--vpick-width: 280px; --vpick-bg: white"
          />
          <div
            style="
              text-align: center;
              margin-top: 0.5rem;
              font-size: 0.75rem;
              color: #737373;
            "
          >
            <code>{{ JSON.stringify(treeValue) }}</code>
          </div>
        </div>
        <div>
          <div
            style="
              text-align: center;
              font-size: 0.75rem;
              color: #737373;
              margin-bottom: 0.5rem;
            "
          >
            Multiple
          </div>
          <v-pick
            v-model="treeMultiValue"
            :options="treeOptions"
            :searchable="treeSearchable"
            :clearable="treeClearable"
            :disable-branch-nodes="treeDisableBranches"
            :default-expand-level="treeDefaultExpandLevel || undefined"
            :cascade="treeCascade"
            :value-consists-of="treeValueConsistsOf"
            multiple
            placeholder="Select categories"
            style="--vpick-width: 280px; --vpick-bg: white"
          />
          <div
            style="
              text-align: center;
              margin-top: 0.5rem;
              font-size: 0.75rem;
              color: #737373;
            "
          >
            <code>{{ JSON.stringify(treeMultiValue) }}</code>
          </div>
        </div>
      </div>
    </div>

    <div style="height: 400px" />

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
        placeholder="Select a country"
        style="--vpick-width: 300px; --vpick-bg: white"
      />
    </div>
  </div>
</template>
