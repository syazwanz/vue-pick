<script setup lang="ts">
import { ref } from "vue"
import { VPickNative } from "../../src/vue2"
import { status, departments } from "../data"
import "../../src/style.css"
import "../style.css"

const selected = ref(null)
const selectedGroup = ref(null)
const selectedError = ref(null)
const selectedReadonly = ref("done")
const selectedForm = ref(null)
const formSubmitted = ref<string | null>(null)

function onSubmit(e: Event) {
  const data = new FormData(e.target as HTMLFormElement)
  formSubmitted.value = data.get("status") as string
}
</script>

<template>
  <div style="padding: 2rem">
    <h1>VPickNative <small style="color: #888">(Vue 2)</small></h1>

    <section>
      <h2 class="subject">Default</h2>
      <div class="wrapper">
        <label for="status" class="label">Status:</label><br />
        <VPickNative
          id="status"
          v-model="selected"
          :options="status"
          placeholder="Select status"
        />
      </div>
    </section>

    <section>
      <h2 class="subject">Groups</h2>
      <div class="wrapper">
        <label for="dept" class="label">Department:</label><br />
        <VPickNative
          id="dept"
          v-model="selectedGroup"
          :options="departments"
          placeholder="Select department"
        />
      </div>
    </section>

    <section>
      <h2 class="subject">Sizes</h2>
      <div class="wrapper">
        <label for="status" class="label">Default:</label><br />
        <VPickNative
          id="status"
          v-model="selected"
          :options="status"
          placeholder="Default"
        />
      </div>
      <div class="wrapper" style="margin-top: 10px">
        <label for="status" class="label">Small:</label><br />
        <VPickNative
          id="status"
          v-model="selected"
          :options="status"
          placeholder="Small"
          size="sm"
        />
      </div>
    </section>

    <section>
      <h2 class="subject">Error</h2>
      <VPickNative
        v-model="selectedError"
        :options="status"
        placeholder="Select status"
        error="This field is required"
      />
    </section>

    <section>
      <h2 class="subject">Loading</h2>
      <VPickNative :options="status" loading placeholder="Fetching data" />
    </section>

    <section>
      <h2 class="subject">Disabled</h2>
      <VPickNative :options="status" disabled placeholder="Not available" />
    </section>

    <section>
      <h2 class="subject">Readonly</h2>
      <VPickNative v-model="selectedReadonly" :options="status" readonly />
    </section>

    <section>
      <h2 class="subject">Name + Required (form)</h2>
      <form class="wrapper" @submit.prevent="onSubmit">
        <label for="form-status" class="label"> Status: </label>
        <VPickNative
          id="form-status"
          v-model="selectedForm"
          name="status"
          :options="status"
          placeholder="Select status"
          required
        />
        <button type="submit" class="btn">Submit</button>
      </form>
    </section>

    <section>
      <h2 class="subject">Custom Chevron</h2>
      <VPickNative :options="status" placeholder="Select status">
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            style="width: 16px; height: 16px"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
            />
          </svg>
        </template>
      </VPickNative>
    </section>

    <section>
      <h2 class="subject">Custom Loading Icon</h2>
      <VPickNative :options="status" loading placeholder="Fetching">
        <template #loading>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </template>
      </VPickNative>
    </section>
  </div>
</template>
