<script setup lang="ts">
import { ref } from "vue"
import { VPickNative, VPick } from "../../src/vue2"
import { status, departments, timezones } from "../data"
import "../../src/style.css"
import "../style.css"

const selected = ref(null)
const selectedGroup = ref(null)
const selectedError = ref(null)
const selectedForm = ref(null)
const formSubmitted = ref<string | null>(null)
const selectedCustom = ref(null)
const selectedCustomGroup = ref(null)
const selectedTimezone = ref(null)
const selectedByKey = ref<number | null>(null)
const selectedByKeyNative = ref<number | null>(null)

const selectedSearch = ref<string | null>(null)
const selectedSearchGroup = ref<string | null>(null)
const selectedClearable = ref<string | null>("in-progress")
const selectedSearchClear = ref<string | null>(null)

const allCountries = [
  { label: "Australia", value: "au" },
  { label: "Brazil", value: "br" },
  { label: "Canada", value: "ca" },
  { label: "Denmark", value: "dk" },
  { label: "Egypt", value: "eg" },
  { label: "France", value: "fr" },
  { label: "Germany", value: "de" },
  { label: "Indonesia", value: "id" },
  { label: "Japan", value: "jp" },
  { label: "Malaysia", value: "my" },
  { label: "Norway", value: "no" },
  { label: "Poland", value: "pl" },
  { label: "Spain", value: "es" },
  { label: "Thailand", value: "th" },
  { label: "Vietnam", value: "vn" },
]

// Custom filter demo: match label OR value
const selectedCustomFilter = ref<string | null>(null)
const customFilterFn = (opt: { label: string; value: string }, q: string) => {
  const needle = q.toLowerCase()
  return (
    opt.label.toLowerCase().includes(needle) ||
    String(opt.value).toLowerCase().includes(needle)
  )
}

const users = [
  { id: 1, name: "Alice", inactive: false },
  { id: 2, name: "Bob", inactive: false },
  { id: 3, name: "Charlie", inactive: true },
]

const regions = [
  {
    name: "Americas",
    members: [
      { id: "us", name: "United States" },
      { id: "ca", name: "Canada" },
    ],
  },
  {
    name: "Europe",
    members: [
      { id: "uk", name: "United Kingdom" },
      { id: "de", name: "Germany" },
    ],
  },
]

function onSubmit(e: Event) {
  const data = new FormData(e.target as HTMLFormElement)
  formSubmitted.value = data.get("status") as string
}
</script>

<template>
  <div style="padding: 1rem">

    <div class="container">
      <div class="title-container">
        <h1 class="title">&lt;v-pick /&gt;</h1>
      </div>

      <section class="section">
        <h2 class="section__title">Default</h2>
        <div class="section__content">
          <v-pick v-model="selectedCustom" :options="status" placeholder="Select status" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedCustom ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Groups</h2>
        <div class="section__content">
          <v-pick v-model="selectedCustomGroup" :options="departments" placeholder="Select department" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedCustomGroup ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Group Timezone</h2>
        <div class="section__content">
          <v-pick v-model="selectedTimezone" :options="timezones" placeholder="Select a timezone" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedTimezone ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Separators</h2>
        <div class="section__content">
          <v-pick v-model="selectedTimezone" :options="timezones" placeholder="Select a timezone" separators />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Searchable</h2>
        <div class="section__content">
          <v-pick v-model="selectedSearch" :options="status" searchable placeholder="Type to search" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedSearch ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Searchable + Groups</h2>
        <div class="section__content">
          <v-pick v-model="selectedSearchGroup" :options="timezones" searchable placeholder="Search timezones" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedSearchGroup ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Clearable</h2>
        <div class="section__content">
          <v-pick v-model="selectedClearable" :options="status" clearable placeholder="Select status" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedClearable ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Searchable + Clearable</h2>
        <div class="section__content">
          <v-pick v-model="selectedSearchClear" :options="timezones" searchable clearable
            placeholder="Search timezones" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedSearchClear ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Custom Filter (matches label or value)</h2>
        <div class="section__content">
          <v-pick v-model="selectedCustomFilter" :options="allCountries" searchable clearable :filter="customFilterFn"
            placeholder="Search by name or code (e.g. 'my')" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedCustomFilter ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Searchable inside overflow: hidden</h2>
        <div class="section__content">
          <div
            style="height: 120px; overflow: hidden; padding: 1rem; border: 1px dashed var(--vpick-border-color, #ccc); border-radius: 8px;">
            <v-pick :options="timezones" searchable placeholder="Dropdown should escape the box" />
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Testing</h2>
        <div class="section__content">
          <v-pick v-model="selectedSearchClear" :options="timezones" searchable rotate-icon clearable
            placeholder="Search timezones" style="--vpick-width:20rem" ; />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Error</h2>
        <div class="section__content">
          <v-pick :options="status" error="This field is required" placeholder="Select status" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Loading</h2>
        <div class="section__content">
          <v-pick :options="status" loading placeholder="Fetching data" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Disabled</h2>
        <div class="section__content">
          <v-pick :options="status" disabled placeholder="Not available" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Sizes</h2>
        <div class="section__content">
          <v-pick :options="status" placeholder="Default" />
          <v-pick :options="status" placeholder="Small" size="sm" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Custom Keys ({id, name, inactive})</h2>
        <div class="section__content">
          <v-pick v-model="selectedByKey" :options="users" value-key="id" label-key="name" disabled-key="inactive"
            placeholder="Select user" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedByKey ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Custom Keys + Groups ({name, members})</h2>
        <div class="section__content">
          <v-pick :options="regions" value-key="id" label-key="name" group-options-key="members"
            placeholder="Select region" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Rotate Icon</h2>
        <div class="section__content">
          <v-pick :options="status" placeholder="Default" rotate-icon />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Custom Chevron</h2>
        <div class="section__content">
          <v-pick :options="status" placeholder="Select status">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" style="width: 16px; height: 16px">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </template>
          </v-pick>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Custom Loading Icon</h2>
        <div class="section__content">
          <v-pick :options="status" loading placeholder="Fetching">
            <template #loading>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </template>
          </v-pick>
        </div>
      </section>


      <section class="section">
        <h2 class="section__title">Required</h2>
        <div class="section__content">
          <form class="form-row" @submit.prevent="onSubmit">
            <v-pick v-model="selectedForm" name="status" :options="status" placeholder="Select status" required />
            <button type="submit" class="btn btn--pick">Submit</button>
          </form>
          <pre class="debug">submitted: <code class="debug__val">{{ formSubmitted ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Inside overflow: hidden</h2>
        <div class="section__content">
          <div
            style="height: 120px; overflow: hidden; padding: 1rem; border: 1px dashed var(--vpick-border-color, #ccc); border-radius: 8px;">
            <v-pick :options="timezones" placeholder="Dropdown should escape the box" />
          </div>
        </div>
      </section>

    </div>

    <div class="container" style="margin-top: 6rem;">

      <div class="title-container">
        <h1 class="title">&lt;v-pick-native /&gt;</h1>
      </div>

      <section class="section">
        <h2 class="section__title">Default</h2>
        <div class="section__content">
          <v-pick-native id="status" v-model="selected" :options="status" placeholder="Select status" />
          <pre class="debug">v-model: <code class="debug__val">{{ selected ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Groups</h2>
        <div class="section__content">
          <v-pick-native id="dept" v-model="selectedGroup" :options="departments" placeholder="Select department" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedGroup ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Group Timezone</h2>
        <div class="section__content">
          <v-pick-native v-model="selectedTimezone" :options="timezones" placeholder="Select a timezone" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedTimezone ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Sizes</h2>
        <div class="section__content">
          <v-pick-native id="default" :options="status" placeholder="Default" />
          <v-pick-native id="small" :options="status" placeholder="Small" size="sm" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Error</h2>
        <div class="section__content">
          <v-pick-native v-model="selectedError" :options="status" placeholder="Select status"
            error="This field is required" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Loading</h2>
        <div class="section__content">
          <v-pick-native :options="status" loading placeholder="Fetching data" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Disabled</h2>
        <div class="section__content">
          <v-pick-native :options="status" disabled placeholder="Not available" />
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Custom Keys ({id, name, inactive})</h2>
        <div class="section__content">
          <v-pick-native v-model="selectedByKeyNative" :options="users" value-key="id" label-key="name"
            disabled-key="inactive" placeholder="Select user" />
          <pre class="debug">v-model: <code class="debug__val">{{ selectedByKeyNative ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Required</h2>
        <div class="section__content">
          <form class="form-row" @submit.prevent="onSubmit">
            <v-pick-native v-model="selectedForm" name="status" :options="status" placeholder="Select status"
              required />
            <button type="submit" class="btn btn--pick">Submit</button>
          </form>
          <pre class="debug">submitted: <code class="debug__val">{{ formSubmitted ?? 'null' }}</code></pre>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Custom Chevron</h2>
        <div class="section__content">
          <v-pick-native :options="status" placeholder="Select status">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" style="width: 16px; height: 16px">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </template>
          </v-pick-native>
        </div>
      </section>

      <section class="section">
        <h2 class="section__title">Custom Loading Icon</h2>
        <div class="section__content">
          <v-pick-native :options="status" loading placeholder="Fetching">
            <template #loading>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </template>
          </v-pick-native>
        </div>
      </section>
    </div>
  </div>
</template>
