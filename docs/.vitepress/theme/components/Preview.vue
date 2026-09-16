<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useId,
  watch,
  watchEffect,
} from "vue"
import { codeToHtml } from "shiki"

// useId, not a counter: these are server-rendered and a counter drifts on
// hydration.
const uid = useId()

const props = withDefaults(
  defineProps<{
    code: string
    lang?: string
  }>(),
  {
    lang: "vue",
  },
)

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

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
    // Shiki failed. Fall back to plain text, escaped: this is the one path
    // where the string is not already Shiki-generated markup.
    highlighted.value = `<pre>${escapeHtml(props.code)}</pre>`
  }
})

/**
 * The labels are rendered twice, dark on the page and light on the highlight,
 * with the light copy clipped to the highlight's rectangle. One moving clip
 * carries both the highlight and the colour flip.
 *
 * A single row cannot: text colour would have to interpolate, and no single
 * colour reads against both sides while a label straddles the edge.
 */
const tabsEl = ref<HTMLElement | null>(null)
const pill = ref({ left: 0, width: 0, total: 0 })
// Gates the first paint, so the highlight does not sweep in from the left.
const measured = ref(false)

function movePill() {
  const row = tabsEl.value
  const active = row?.querySelector<HTMLElement>(".is-active")
  if (!row || !active) return
  pill.value = {
    left: active.offsetLeft,
    width: active.offsetWidth,
    total: row.offsetWidth,
  }
  measured.value = true
}

const clip = computed(() => {
  const right = Math.max(
    0,
    pill.value.total - (pill.value.left + pill.value.width),
  )
  return {
    clipPath: `inset(0 ${right}px 0 ${pill.value.left}px round 0.375rem)`,
  }
})

// Reached through `window` so the lint config does not need the DOM global
// declared.
let observer: InstanceType<typeof window.ResizeObserver> | undefined

onMounted(() => {
  movePill()
  // Label widths shift when the display font finishes loading, and again on
  // any container resize.
  observer = new window.ResizeObserver(movePill)
  if (tabsEl.value) observer.observe(tabsEl.value)
})

onBeforeUnmount(() => observer?.disconnect())

watch(tab, () => nextTick(movePill))

/** One tab stop for the list, arrows moving within it. */
function onKeydown(event: KeyboardEvent) {
  const order = ["preview", "code"] as const
  const step = { ArrowRight: 1, ArrowLeft: -1, Home: 0, End: 0 }[event.key]
  if (step === undefined) return

  event.preventDefault()
  const next =
    event.key === "Home"
      ? order[0]
      : event.key === "End"
        ? order[order.length - 1]
        : order[(order.indexOf(tab.value) + step + order.length) % order.length]

  tab.value = next
  // Roving tabindex: focus has to follow selection explicitly.
  nextTick(() => {
    tabsEl.value?.querySelector<HTMLElement>(".is-active")?.focus()
  })
}

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
      <div
        ref="tabsEl"
        class="preview__switch"
        role="tablist"
        @keydown="onKeydown"
      >
        <button
          :id="`${uid}-tab-preview`"
          type="button"
          role="tab"
          class="preview__tab"
          :class="{ 'is-active': tab === 'preview' }"
          :aria-selected="tab === 'preview'"
          :aria-controls="`${uid}-panel-preview`"
          :tabindex="tab === 'preview' ? 0 : -1"
          @click="tab = 'preview'"
        >
          Preview
        </button>
        <button
          :id="`${uid}-tab-code`"
          type="button"
          role="tab"
          class="preview__tab"
          :class="{ 'is-active': tab === 'code' }"
          :aria-selected="tab === 'code'"
          :aria-controls="`${uid}-panel-code`"
          :tabindex="tab === 'code' ? 0 : -1"
          @click="tab = 'code'"
        >
          Code
        </button>

        <!--
          The same two labels again, light on the highlight. Inert: the real
          buttons above carry every interaction.
        -->
        <div
          v-show="measured"
          class="preview__lit"
          aria-hidden="true"
          :style="clip"
        >
          <span class="preview__tab">Preview</span>
          <span class="preview__tab">Code</span>
        </div>
      </div>
    </div>

    <div
      v-show="tab === 'preview'"
      :id="`${uid}-panel-preview`"
      class="preview__panel preview__panel--demo"
      role="tabpanel"
      :aria-labelledby="`${uid}-tab-preview`"
      tabindex="0"
    >
      <slot />
    </div>

    <div
      v-show="tab === 'code'"
      :id="`${uid}-panel-code`"
      class="preview__panel preview__panel--code"
      role="tabpanel"
      :aria-labelledby="`${uid}-tab-code`"
      tabindex="0"
    >
      <button
        type="button"
        class="preview__copy"
        :aria-label="copied ? 'Copied' : 'Copy code'"
        @click="copy"
      >
        <span v-if="copied">Copied</span>
        <span v-else>Copy</span>
      </button>
      <!--
        Shiki emits highlighted markup that has to render as HTML. The source is
        a ?raw import of a local example file resolved at build time, never user
        input, and the non-Shiki fallback above is escaped.
      -->
      <!-- eslint-disable-next-line vue/no-v-html -->
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

/* Inset so the highlight clears the block's edge. Aligning the labels with the
   code below instead needs 0.375rem, which pins it against the border. */
.preview__tabs {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.preview__switch {
  position: relative;
  display: inline-flex;
}

.preview__lit {
  position: absolute;
  inset: 0;
  display: inline-flex;
  background-color: var(--ink);
  color: var(--paper);
  pointer-events: none;
  transition: clip-path 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}

/* Both layers share this, so their text metrics match exactly. */
.preview__tab {
  padding: 0.375rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--muted);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.preview__tab:hover {
  color: var(--ink);
}

.preview__lit .preview__tab {
  color: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .preview__lit {
    transition: none;
  }
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
  background-color: var(--ink);
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

/* Pinned dark whatever the page does. Shiki emits both themes per token, so
   this costs no extra highlight pass. */
.preview__code :deep(.shiki),
.preview__code :deep(.shiki span) {
  color: var(--shiki-dark) !important;
  background-color: transparent !important;
}

.preview__copy {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #a1a1aa;
  background-color: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 0.375rem;
  cursor: pointer;
  transition:
    color 0.15s,
    background-color 0.15s;
  z-index: 1;
}

.preview__copy:hover {
  color: #fafafa;
  background-color: #3f3f46;
}
</style>
