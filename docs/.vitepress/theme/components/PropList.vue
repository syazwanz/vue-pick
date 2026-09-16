<script setup lang="ts">
import { computed } from "vue"
import {
  props as allProps,
  type ComponentName,
  type PropDoc,
  type PropGroup,
} from "../../data/props"

const p = withDefaults(
  defineProps<{
    /** Which component's props to draw from. */
    component?: ComponentName
    /** Comma-separated group names, e.g. "tree" or "search,multiple". */
    group?: string
    /** Comma-separated prop names, for cherry-picking across groups. */
    names?: string
  }>(),
  {
    component: "VPick",
    group: "",
    names: "",
  },
)

function split(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

const list = computed<PropDoc[]>(() => {
  const forComponent = allProps.filter((prop) =>
    prop.components.includes(p.component),
  )

  const names = split(p.names)
  if (names.length) {
    const wanted = new Set(names)
    return forComponent.filter((prop) => wanted.has(prop.name))
  }

  const groups = split(p.group) as PropGroup[]
  if (groups.length) {
    const wanted = new Set(groups)
    return forComponent.filter((prop) => wanted.has(prop.group))
  }

  return forComponent
})

/**
 * Descriptions live in a `.ts` file, so the markdown compiler never sees them.
 * Covers the three constructs used there. Do not write `**bold**` or a link
 * inside a code span: this would pick it up.
 */
function inlineMarkdown(src: string): string {
  return src
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}
</script>

<template>
  <div class="props">
    <div
      v-for="prop in list"
      :id="`prop-${prop.name}`"
      :key="prop.name"
      class="prop"
    >
      <div class="prop__head">
        <code class="prop__name">{{ prop.name }}</code>
        <code class="prop__type">{{ prop.type }}</code>
        <span v-if="prop.default === 'required'" class="prop__required">
          required
        </span>
        <span v-else class="prop__default">
          default <code>{{ prop.default }}</code>
        </span>
      </div>

      <!--
        Authored in data/props.ts, resolved at build time, never user input.
        The escaping in inlineMarkdown runs before any tag is introduced.
      -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p class="prop__desc" v-html="inlineMarkdown(prop.description)" />

      <p v-if="prop.more" class="prop__more">
        <a :href="prop.more">Read more</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.props {
  margin: 1.25rem 0;
  border-top: 1px solid var(--vp-c-divider);
}

.prop {
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
  scroll-margin-top: var(--vp-nav-height);
}

.prop__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

/* The default theme styles `code` inside prose, so these reset back down. */
.prop__head code {
  padding: 0.125rem 0.5rem;
  font-size: 0.8125rem;
  border-radius: 0.25rem;
}

.prop__name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

/* custom.css puts a border on every inline `code`, so these need real
   horizontal padding or the box hugs the text. */
.prop__type {
  color: var(--vp-c-text-2);
  background-color: transparent;
}

.prop__default,
.prop__required {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.prop__default code {
  font-size: 0.75rem;
  background-color: transparent;
}

.prop__required {
  font-weight: 600;
  color: var(--vp-c-warning-1);
}

.prop__desc {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.prop__desc :deep(code) {
  font-size: 0.8125rem;
}

.prop__more {
  margin: 0.375rem 0 0;
  font-size: 0.8125rem;
}

/* Long union types are the one thing that can force a horizontal scroll, so
   let them wrap rather than widening the page. */
@media (max-width: 640px) {
  .prop__type {
    flex-basis: 100%;
    word-break: break-word;
  }
}
</style>
