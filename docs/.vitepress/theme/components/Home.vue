<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue"
import { VPick } from "vue-pick"

/**
 * The hero is the component itself, not a picture of it, and the keycaps light
 * as you drive the tree so keyboard support is visible rather than claimed.
 */

const picked = ref<string[]>(["frontend"])

/** Long labels: a select's job is holding text of unpredictable length. */
const categories = [
  {
    label: "Engineering",
    value: "engineering",
    children: [
      { label: "Frontend Engineering", value: "frontend" },
      { label: "Platform & Infrastructure", value: "platform" },
      { label: "Quality Assurance", value: "qa" },
      {
        // Nests one level deeper than the rest, so the opening view shows a
        // chevron on a child row: proof the tree goes past two levels without
        // having to expand anything to see it.
        label: "Developer Experience",
        value: "devex",
        children: [
          { label: "Build Tooling", value: "build-tooling" },
          { label: "Release Engineering", value: "release-eng" },
        ],
      },
    ],
  },
  {
    label: "Design & Research",
    value: "design",
    children: [
      { label: "Product Design", value: "product-design" },
      { label: "Design Systems", value: "design-systems" },
      { label: "User Research", value: "user-research" },
    ],
  },
  {
    label: "Go to Market",
    value: "gtm",
    children: [
      { label: "Solutions Engineering", value: "solutions" },
      { label: "Customer Success", value: "customer-success" },
      { label: "Partnerships", value: "partnerships" },
    ],
  },
  {
    label: "Operations",
    value: "operations",
    children: [
      { label: "Workplace Experience", value: "workplace" },
      { label: "People & Culture", value: "people" },
      { label: "Finance & Legal", value: "finance" },
    ],
  },
]

/** Where to get it, and where the source is. Nothing else. */
const badges = [
  {
    href: "https://www.npmjs.com/package/vue-pick",
    // Shields defaults this one to orange, which fights the green everywhere
    // else on the page.
    src: "https://img.shields.io/npm/v/vue-pick?color=41b883",
    alt: "npm version",
  },
  {
    href: "https://github.com/syazwanz/vue-pick",
    src: "https://img.shields.io/badge/GitHub-source-181717?logo=github&logoColor=white",
    alt: "Source on GitHub",
  },
]

/**
 * Opens the first branch only. No prop does this: `defaultExpandLevel` opens
 * every branch at a level, and the expand-on-open pass never runs for an
 * `alwaysOpen` list. Clicks the same chevron a visitor would.
 */
const demoPanel = ref<HTMLElement | null>(null)

onMounted(async () => {
  await nextTick()
  demoPanel.value
    ?.querySelector<HTMLButtonElement>(".vpick-option-expand")
    ?.click()
})

/**
 * Brings a newly expanded branch into view. The list is height-capped so the
 * hero never resizes, which means a branch near the bottom opens below the fold
 * and looks like nothing happened.
 *
 * `.capture` because the chevron is `@click.stop`, so nothing reaches a bubble
 * listener up here. Capture also runs before the expand, hence the rAF.
 */
function onDemoClick(event: MouseEvent) {
  const panel = demoPanel.value
  const row = (event.target as HTMLElement).closest<HTMLElement>(
    ".vpick-option",
  )
  if (!panel || !row) return

  // Real clicks only: the mount patch above clicks a chevron itself, and
  // everything below should only answer a person.
  if (!event.isTrusted) return

  // Put focus on the input after picking, so the keyboard can carry on from
  // where the pointer left off. See onDemoMousedown for why it is lost.
  requestAnimationFrame(() => {
    panel.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus()
  })

  const before = panel.querySelectorAll(".vpick-option").length
  const listBefore = panel.querySelector<HTMLElement>(".vpick-listbox")
  const heightBefore = listBefore?.getBoundingClientRect().height ?? 0
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Pin the current height now, synchronously, while this is still the capture
  // phase and Vue has not inserted anything. rAF fires after layout, so
  // without this the list paints one frame at its new full height before the
  // animation snaps it back to the start: the row jumps down, then crawls back
  // up. Pinning first means the only height anyone sees is the animated one.
  if (listBefore && !reduced) listBefore.style.height = `${heightBefore}px`

  requestAnimationFrame(() => {
    const list = panel.querySelector<HTMLElement>(".vpick-listbox")
    const rows = [...panel.querySelectorAll<HTMLElement>(".vpick-option")]
    if (!list) return

    // Measure what the list wants to be, then put the pin back before handing
    // both values to the Web Animations API. The list is content-sized, so
    // there is no pair of values for CSS alone to interpolate between.
    // Runs for collapse as well as expand, hence before the row-count guard.
    // Inferred rather than annotated `Animation`: that global is known to
    // vue-tsc but not to eslint's no-undef inside an SFC.
    let grow: ReturnType<HTMLElement["animate"]> | null = null
    if (!reduced) {
      list.style.height = ""
      const heightAfter = list.getBoundingClientRect().height

      if (heightAfter !== heightBefore) {
        list.style.height = `${heightBefore}px`
        grow = list.animate(
          [{ height: `${heightBefore}px` }, { height: `${heightAfter}px` }],
          { duration: 200, easing: "ease-out" },
        )
        // Hand the box back to the content once the animation lands.
        grow.finished.then(() => (list.style.height = "")).catch(() => {})
      }
    }

    // Only expansion reveals anything below the fold. Collapsing and picking
    // do not, so the scroll below is expand-only.
    if (rows.length <= before) return

    const start = rows.indexOf(row)
    if (start < 0) return

    // Walk forward while rows are deeper than the branch: those are its
    // descendants, and the last one is what needs to be on screen.
    const depth = Number(row.dataset.depth ?? 0)
    let last = start
    while (
      last + 1 < rows.length &&
      Number(rows[last + 1].dataset.depth ?? 0) > depth
    ) {
      last += 1
    }

    // After the box has grown, not during: mid-animation the scroll measures
    // against a height still changing and aims at the wrong place.
    const scrollLastChildIntoView = () => {
      const listBox = list.getBoundingClientRect()
      const target = rows[last].getBoundingClientRect()
      if (target.bottom <= listBox.bottom) return

      list.scrollTo({
        top: list.scrollTop + (target.bottom - listBox.bottom),
        // Honoured manually rather than left to CSS `scroll-behavior`, since
        // that would also apply to the component's own scrolling.
        behavior: reduced ? "auto" : "smooth",
      })
    }

    if (grow) {
      grow.finished.then(scrollLastChildIntoView).catch(() => {})
    } else {
      scrollLastChildIntoView()
    }
  })
}

/**
 * Stops an option row stealing focus. The chevron guards itself with
 * `@mousedown.prevent`, the row does not, so pressing one drops focus on the
 * body and the arrow keys go dead. Capture, or the row's listeners run first.
 */
function onDemoMousedown(event: MouseEvent) {
  if ((event.target as HTMLElement).closest(".vpick-option")) {
    event.preventDefault()
  }
}

/**
 * Which device last moved the highlight. From the pointer it means "under your
 * cursor" and should vanish on leave; from the keyboard it means "where you
 * are" and must stay. `:focus-within` cannot tell them apart, since clicking a
 * row leaves focus in the input.
 */
const keyNav = ref(false)

/** Keycap readout. `null` unless a key was pressed inside the tree. */
const lastKey = ref<string | null>(null)
let clearTimer: ReturnType<typeof setTimeout> | undefined

const keys = [
  { id: "ArrowUp", glyph: "↑", label: "Up" },
  { id: "ArrowDown", glyph: "↓", label: "Down" },
  { id: "ArrowLeft", glyph: "←", label: "Collapse" },
  { id: "ArrowRight", glyph: "→", label: "Expand" },
  { id: "Enter", glyph: "↵", label: "Select" },
  { id: "Escape", glyph: "esc", label: "Close" },
]

function onKey(event: KeyboardEvent) {
  if (!keys.some((k) => k.id === event.key)) return
  keyNav.value = true
  lastKey.value = event.key
  clearTimeout(clearTimer)
  clearTimer = setTimeout(() => (lastKey.value = null), 420)
}

const icon = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

const features = [
  {
    title: "Tree select",
    details: "Nested options with cascading parent and child selection.",
    icon: icon(
      '<path d="M21 12h-8"/><path d="M21 18h-8"/><path d="M21 6h-8"/><path d="M3 6v4c0 1.1.9 2 2 2h3"/><path d="M3 10v6c0 1.1.9 2 2 2h3"/>',
    ),
  },
  {
    title: "Native or custom",
    details: "A styled native select, or a full custom dropdown.",
    icon: icon(
      '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m16 10-4 4-4-4"/>',
    ),
  },
  {
    title: "Vue 2.7 + Vue 3",
    details: "Same component API, same props, same slots, same CSS.",
    icon: icon(
      '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    ),
  },
  {
    title: "Fully accessible",
    details: "Keyboard, ARIA, and screen reader ready.",
    icon: icon(
      '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-5.87.94"/><path d="m5 8 3-3 5.5 3-2.21 3.1"/><path d="M4.24 14.48c-.19.58-.27 1.2-.23 1.84a5 5 0 0 0 5.31 4.67c2.76-.17 4.86-2.54 4.69-5.3"/>',
    ),
  },
  {
    title: "Customizable",
    details: "Theme every visual token via CSS custom properties.",
    icon: icon(
      '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    ),
  },
  {
    // "Zero dependencies" sits in the hero lede rather than here: every card
    // links to a docs page, and that claim has no page to point at.
    title: "Any data shape",
    details: "Point labelKey and valueKey at fields you already have.",
    icon: icon(
      '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
    ),
  },
]

const copied = ref(false)
async function copyInstall() {
  try {
    await navigator.clipboard.writeText("npm i vue-pick")
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard blocked. The command is visible either way.
  }
}
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero__copy">
        <p class="pill">Vue Select Component</p>

        <h1 class="display">
          Pick anything,<br />
          <span class="display__mark">however deep</span> it sits.
        </h1>

        <p class="lede">
          Select, multiselect, and tree select for Vue 2.7 and Vue 3, from one
          codebase, with zero dependencies.
        </p>

        <div class="cta">
          <a class="btn" href="/guide/introduction">Read the guide</a>
          <button type="button" class="install" @click="copyInstall">
            <span class="install__prompt">$</span>
            <span class="install__cmd">npm i vue-pick</span>
            <span class="install__hint">{{ copied ? "copied" : "copy" }}</span>
          </button>
        </div>
      </div>

      <!-- The demo, and the keys that drive it -->
      <div class="hero__demo">
        <div
          ref="demoPanel"
          class="panel"
          :class="{ 'is-key-nav': keyNav }"
          @keydown="onKey"
          @mousemove="keyNav = false"
          @mousedown.capture="onDemoMousedown"
          @click.capture="onDemoClick"
        >
          <p class="panel__label">assign to a team</p>
          <!-- First branch is opened on mount. See the note in the script. -->
          <VPick
            v-model="picked"
            :options="categories"
            always-open
            multiple
            searchable
            clearable
            disable-branch-nodes
            placeholder="Search teams"
            :style="{
              '--vpick-width': '100%',
              // Height is capped in CSS below rather than here, so the list can
              // shrink while its column holds the space. See the :deep rule.
              /*
                The component ships 10, which reads as a container rather than
                a control. Pulled down to 6, with the rows at 4 so they still
                nest inside the list. Landing page only; the docs keep the
                shipped default.
              */
              '--vpick-border-radius': '0.375rem',
              '--vpick-option-radius': '0.25rem',
              /*
                The component ships #e5e5e5 and the page's cards use #e4e4e7.
                Near enough to look like a mistake rather than a choice, so the
                demo borrows the page's rule colour.
              */
              '--vpick-border-color': 'var(--rule)',
              /*
                The list draws a 1px ring outside its 1px border, so its edge
                is painted twice and reads heavier than the input above it even
                though both borders are the same colour. Dropping the ring
                leaves one line on each.
              */
              '--vpick-listbox-ring': 'transparent',
            }"
          />
        </div>

        <ul class="keys" aria-hidden="true">
          <li
            v-for="k in keys"
            :key="k.id"
            class="key"
            :class="{ 'is-live': lastKey === k.id }"
          >
            <span class="key__cap">{{ k.glyph }}</span>
            <span class="key__label">{{ k.label }}</span>
          </li>
        </ul>
        <!--
          The search input is the only tabbable element; the chevrons and the
          chip's remove button are all tabindex="-1", so focus lives on the
          input and aria-activedescendant tracks the row. The note points at the
          search box, not the list: clicking a row picks it, and rows never
          take focus.
        -->
        <p class="keys__note">
          Click the search box, then drive the tree from the keyboard.
        </p>
      </div>
    </section>

    <!--
      Full width so its band can reach the screen edges. The inner wrapper
      carries the same 72rem measure as everything else, so the cards stay
      lined up with the hero and the tail.
    -->
    <section class="features">
      <div class="wrap">
        <header class="section-head">
          <h2 class="display display--sm">Works with what you have.</h2>
        </header>

        <ul>
          <li v-for="f in features" :key="f.title" class="feature">
            <!--
              Static SVG strings defined in this file, never user input. Same
              approach the default theme uses for its own feature icons.
            -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span class="feature__icon" v-html="f.icon" />
            <h3>{{ f.title }}</h3>
            <p>{{ f.details }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="tail">
      <div>
        <h2 class="display display--sm">Add it to your project.</h2>
        <p class="tail__sub">
          Install, import the stylesheet, pick a component.
        </p>
      </div>

      <div class="tail__actions">
        <button type="button" class="install" @click="copyInstall">
          <span class="install__prompt">$</span>
          <span class="install__cmd">npm i vue-pick</span>
          <span class="install__hint">{{ copied ? "copied" : "copy" }}</span>
        </button>
        <p class="tail__badges">
          <a v-for="b in badges" :key="b.src" :href="b.href">
            <img :src="b.src" :alt="b.alt" height="20" />
          </a>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Full width. The measure lives on .wrap instead, so a section that wants a
   band to reach the screen edges can simply not use one. Constraining here and
   breaking out with viewport maths does not work: 100vw counts the scrollbar,
   so the band overhangs by its width and the page scrolls sideways. */
.home {
  --gutter: 1.5rem;
  padding-bottom: 3.5rem;
}

.wrap {
  max-width: 72rem;
  margin: 0 auto;
  padding-inline: var(--gutter);
}

/* Type */

.display {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.25rem, 6vw, 3.75rem);
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--vp-c-text-1);
  margin: 0;
}

/* Shared by the section heads, so they stay the same size as each other. */
.display--sm {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  letter-spacing: -0.03em;
}

/* Pill */

/* A neutral grey, a shade off the white page so the pill still reads as a
   shape. A green fill would fight the coloured ring, since both share a hue;
   against a neutral the ring is the only colour, which is what makes it
   visible. Near-black text on it is 16.1:1. */
.pill {
  position: relative;
  display: inline-block;
  margin: 0 0 1.5rem;
  padding: 0.1875rem 0.8125rem;
  border-radius: 999px;
  background-color: var(--paper-2);
  color: var(--ink);
  /* The display face, which carries an optical size axis, so it holds up at
     label sizes rather than looking like a shrunk headline. Tracked out a
     little, since small and wide reads as a label. */
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1.5;
}

/* The ring. A conic gradient wraps the colours around the border and rotates,
   then two masks clip it to a 1px band: they cancel everywhere except between
   the border box and the padding box, so only the edge is painted.
   Green plus two cool neighbours rather than a full spectrum. The gradient is
   written out in both pseudo-elements on purpose. Hoisting it to a shared
   custom property on .pill freezes it, because var(--pill-angle) then resolves
   against .pill, which is not the element being animated. */
.pill::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background-image: conic-gradient(
    from var(--pill-angle),
    #41b883,
    #21c0bd,
    #5b9bf0,
    #ffb648,
    #41b883
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: pill-shine 4s linear infinite;
  pointer-events: none;
}

/* The glow. z-index -1 puts it behind the pill's own background, so only the
   part that spills past the edge is visible, which is what reads as a halo. */
.pill::after {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: inherit;
  background-image: conic-gradient(
    from var(--pill-angle),
    #41b883,
    #21c0bd,
    #5b9bf0,
    #ffb648,
    #41b883
  );
  filter: blur(10px);
  opacity: 0.22;
  animation: pill-shine 4s linear infinite;
  pointer-events: none;
}

/* Registered so the browser interpolates it as an angle. Without this it is
   just a string, and the rotation snaps from 0 to 360 instead of sweeping. */
@property --pill-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes pill-shine {
  to {
    --pill-angle: 360deg;
  }
}

/* The hero headline is the one place a deliberate green mark sits behind the
   text. Dragging across it would lay ::selection, which is the same green, on
   top of that and turn both to mush. Only the h1, so the section heads and
   every other word on the page stay selectable. */
h1.display {
  -webkit-user-select: none;
  user-select: none;
}

/* The one flourish: a marker swipe through the lower half of the phrase.
   Filling the whole line box would make a solid block of saturated green that
   outweighs everything else on the page, the demo included. Padding rather
   than box-shadow for the bleed, since a shadow cannot carry the gradient. */
.display__mark {
  /* Lifted off the very bottom so it strikes through the lower half of the
     letters instead of hanging under them like a rule. Roughly baseline to
     two thirds of x-height. */
  background-image: linear-gradient(
    to top,
    transparent 0.1em,
    var(--highlight) 0.1em,
    var(--highlight) 0.58em,
    transparent 0.58em
  );
  padding-inline: 0.1em;
  margin-inline: -0.1em;
}

.lede {
  max-width: 34rem;
  margin: 1.5rem 0 0;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

/* Hero */

/* Hero and tail are not full-bleed, so they carry the measure themselves
   rather than needing a wrapper element of their own. */
.hero,
.tail {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.hero {
  display: grid;
  gap: 3rem;
  padding-block: 4rem 3.5rem;
}

@media (min-width: 900px) {
  .hero {
    grid-template-columns: 1.05fr 0.95fr;
    /* Not centred. Expanding a branch makes the demo column taller, and
       centring re-splits that growth above and below, so the headline shifts
       up while the list grows. Anchoring both columns to the top means only
       the bottom of the demo moves. */
    align-items: start;
    gap: 4rem;
    /* padding-block only: the inline padding is the page gutter, set above. */
    padding-block: 5.5rem 4.5rem;
  }

  /* Reserve the tallest state the demo can reach: the list at its 15.375rem
     ceiling plus the trigger, label and keycaps. The panel is then free to
     shrink when branches collapse without the column following it, so the
     headline beside it and the section below it never move. Both this and the
     ceiling above are sized to the opening view, eight rows, so raising one
     means raising the other. */
  .hero__demo {
    min-height: 27.375rem;
  }
}

.cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.install {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
  background-color: var(--paper-2);
  border: 1px solid var(--rule);
  border-radius: 0.5rem;
  cursor: pointer;
}

.install:hover {
  border-color: var(--vp-c-brand-3);
}

.install__prompt {
  color: var(--brand-deep);
}

.install__hint {
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  padding-left: 0.375rem;
  border-left: 1px solid var(--rule);
}

/* Solid near-black, the same ink the headline uses, so the hero has one clear
   primary action. The install box beside it is outlined, and two outlines side
   by side leave neither looking like the thing to do first. */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--paper);
  background-color: var(--ink);
  border: 1px solid var(--ink);
  border-radius: 0.5rem;
  text-decoration: none;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.btn:hover {
  background-color: #2f2f35;
  border-color: #2f2f35;
}

/* Hero demo */

/* No border of its own: the trigger and the list each carry one already, and a
   third concentric outline reads as clutter. Elevation does the separating. */
.panel {
  padding: 1.5rem;
  background-color: var(--vp-c-bg);
  /* Kept a step above the trigger and list inside it, so the nesting still
     reads. */
  border-radius: 0.55rem;
  box-shadow:
    0 1px 2px rgba(15, 27, 45, 0.04),
    0 24px 48px -28px rgba(15, 27, 45, 0.4);
}

/* The inline list sits 0.25rem under the trigger by default, which is a hard
   coded margin rather than a variable, so this reaches in with :deep(). Just
   enough air to read as two separate controls. Landing page only. */
.panel :deep(.vpick--inline .vpick-positioner) {
  margin-top: 0.5rem;
}

/* A ceiling, not a fixed height. A fixed height leaves a slab of empty box
   under the rows whenever branches are collapsed. The list is free to size
   itself; the column below reserves the space instead, so shrinking shows
   ordinary page background rather than a half-empty panel. */
.panel :deep(.vpick-listbox) {
  max-height: 15.5rem;
}

/* The component highlights the row under the pointer and has no mouseleave
   handler, so the grey stays on the last row touched. In a dropdown that is
   invisible, since closing resets it; an alwaysOpen list never closes, so it
   sits there pointing at nothing.
   Suppressed here rather than fixed in the library, which would need a real
   decision about whether the last hovered row should carry over to keyboard
   navigation. `:focus-within` keeps the keyboard highlight, which has to stay
   visible precisely when the pointer is elsewhere. */
/* Neutralise the component's always-on highlight, then paint it back only
   where it is genuinely live. Three rules in specificity order rather than one
   clever selector, because the states are mutually exclusive by meaning and a
   single selector lets them collide. */
.panel :deep(.vpick-option--highlighted) {
  background-color: transparent;
}

/* The component drops the selected tint in `multiple`, on the grounds that the
   checkbox already says it. True in a form, but the hero opens with one team
   already picked and nothing draws the eye to it, so the tint goes back on.
   The row is genuinely selected; only its styling is restored here. */
.panel :deep(.vpick-option--selected) {
  background-color: rgba(var(--brand-rgb), 0.14);
}

/* Live highlight, which outranks the selected tint. Green says "this is
   chosen", grey says "this is where you are", and where you are wins, or
   moving onto an already-selected row looks like nothing responded.
   Live means the pointer is actually over the panel, or the keyboard is
   driving. Nothing else counts. */
.panel:hover :deep(.vpick-option--highlighted),
.panel.is-key-nav :deep(.vpick-option--highlighted) {
  background-color: var(--vpick-option-highlight-bg);
}

.panel__label {
  margin: 0 0 0.625rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Indented by the panel's own 1rem padding, so the keys share a left edge with
   the content inside the card rather than with its border. */
.keys {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin: 1rem 0 0;
  padding: 0 0 0 1rem;
  list-style: none;
}

.key {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem 0.25rem 0.3rem;
  border: 1px solid var(--rule);
  border-radius: 0.375rem;
  background-color: var(--vp-c-bg);
  transition:
    background-color 0.18s,
    border-color 0.18s;
}

.key__cap {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: var(--vp-c-text-1);
  min-width: 1.25rem;
  text-align: center;
}

.key__label {
  font-size: 0.6875rem;
  color: var(--muted);
}

.key.is-live {
  background-color: var(--highlight);
  border-color: var(--vp-c-brand-3);
}

.key.is-live .key__label {
  color: var(--brand-deep);
}

.keys__note {
  margin: 0.625rem 0 0;
  padding-left: 1rem;
  font-size: 0.75rem;
  color: var(--muted);
}

/* Features */

/* The section itself is full width, so the band simply reaches the screen
 * edges: no viewport maths, no scrollbar overhang, nothing to clip. The 72rem
 * measure is on the .wrap inside it.
 *
 * A flat tint rather than a gradient. A grey-to-green gradient this subtle is a
 * weaker signal than the band's own edge, so across the full width it reads as
 * an uneven fill rather than a deliberate sweep. */
.features {
  /* The band's own air, top and bottom. The hero's padding sits outside the
     tint, so the heading needs its own distance from the band edge, more than
     the gap to its cards, or it groups with neither. */
  padding-block: 5rem;
  background-color: #f8fafc;
}

/* Centred, matching the tail, so the two section heads read as a pair. */
.section-head {
  margin-bottom: 2.5rem;
  text-align: center;
}

.features ul {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 640px) {
  .features ul {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .features ul {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* The whole card is the link, so the hover lift means something and the target
   is the full box rather than a few words of heading. */
.feature {
  display: block;
  height: 100%;
  padding: 1.5rem;
  /* 2px, so the hover border is a colour change rather than a size change and
     nothing reflows underneath it. Lighter than --rule: at 2px the page's
     normal rule colour reads twice as heavy as it does elsewhere, and these
     cards want to be quiet until hovered. */
  border: 2px solid #eaeaed;
  border-radius: 0.75rem;
  background-color: var(--vp-c-bg);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

/* A hard offset shadow: 10px across, 10px down, no blur at all. It reads as a
   printed sticker rather than elevation, which is why it can be brand coloured
   where a soft glow would look muddy. The border takes the dark end of the hue
   and the shadow the pale end, so one hover moves two values of the same
   colour rather than introducing a second one. */
.feature:hover {
  border-color: var(--brand-deep);
  box-shadow: 10px 10px 0 #d5efe1;
}

.feature__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1.25rem;
  border-radius: 0.5rem;
  background-color: var(--paper-2);
  color: var(--vp-c-text-1);
}

.feature h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.feature p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

/* Tail */

/* Centred: it is the last thing on the page and the only thing being asked
   for, so it reads better as a single column than split left and right. */
.tail {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  margin-top: 7rem;
  padding-top: 0;
}

.tail__sub {
  max-width: 30rem;
  margin: 0.75rem auto 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.tail__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
}

.tail__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

/* Shields renders at 20px tall; pinning it stops the row jumping as each
   badge arrives, since they load one by one from an external host. */
.tail__badges img {
  display: block;
  height: 20px;
}

@media (prefers-reduced-motion: reduce) {
  .feature,
  .key,
  .btn {
    transition: none;
  }

  /* The ring stays, it just stops travelling. */
  .pill::before {
    animation: none;
  }
}
</style>
