<script setup lang="ts">
import { ref, shallowRef, watchEffect } from "vue"
import { codeToHtml } from "shiki"

const props = withDefaults(
  defineProps<{
    code: string
    lang?: string
  }>(),
  {
    lang: "vue",
  },
)

const tab = ref<"preview" | "code">("preview")
const highlighted = shallowRef<string>("")
const copied = ref(false)

watchEffect(async () => {
  try {
    highlighted.value = await codeToHtml(props.code, {
      lang: props.lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    })
  } catch {
    highlighted.value = `<pre>${props.code}</pre>`
  }
})

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // ignore
  }
}
</script>

<template>
  <div class="preview">
    <div class="preview__tabs">
      <button type="button" class="preview__tab" :class="{ 'is-active': tab === 'preview' }" @click="tab = 'preview'">
        Preview
      </button>
      <button type="button" class="preview__tab" :class="{ 'is-active': tab === 'code' }" @click="tab = 'code'">
        Code
      </button>
    </div>

    <div v-show="tab === 'preview'" class="preview__panel preview__panel--demo">
      <slot />
    </div>

    <div v-show="tab === 'code'" class="preview__panel preview__panel--code">
      <button type="button" class="preview__copy" :aria-label="copied ? 'Copied' : 'Copy code'" @click="copy">
        <span v-if="copied">Copied</span>
        <span v-else>Copy</span>
      </button>
      <div class="preview__code" v-html="highlighted" />
    </div>
  </div>
</template>

<style scoped>
.preview {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.625rem;
  background-color: var(--vp-c-bg);
  overflow: hidden;
}

.preview__tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.preview__tab {
  position: relative;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  bottom: -1px;
}

.preview__tab:hover {
  color: var(--vp-c-text-1);
}

.preview__tab.is-active {
  color: var(--vp-c-text-1);
  border-bottom: 2px solid var(--vp-c-text-1);
}

.preview__panel--demo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 2.5rem 1.5rem;
}

.preview__panel--code {
  position: relative;
}

.preview__code {
  font-size: 0.8125rem;
  line-height: 1.6;
  overflow-x: auto;
}

.preview__code :deep(pre.shiki) {
  margin: 0;
  padding: 1.25rem 1.25rem;
  background-color: transparent !important;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  white-space: pre;
}

.preview__code :deep(pre.shiki code) {
  display: block;
}

/* Light/dark variable swap (shiki dual theme) */
html:not(.dark) .preview__code :deep(.shiki),
html:not(.dark) .preview__code :deep(.shiki span) {
  color: var(--shiki-light) !important;
  background-color: var(--shiki-light-bg, transparent) !important;
}

.dark .preview__code :deep(.shiki),
.dark .preview__code :deep(.shiki span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg, transparent) !important;
}

.preview__copy {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  cursor: pointer;
  transition:
    color 0.15s,
    background-color 0.15s;
  z-index: 1;
}

.preview__copy:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-alt);
}
</style>
