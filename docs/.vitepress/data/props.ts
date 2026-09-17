/**
 * Every prop on both components, defined once. Feature pages render their slice
 * via `<PropList group="..." />`, the API pages render the lot.
 *
 * `tests/docs.props.test.ts` asserts this against the compiled components both
 * ways, so the list cannot fall behind the source.
 */

export type PropGroup =
  | "core"
  | "keys"
  | "appearance"
  | "search"
  | "multiple"
  | "tree"
  | "positioning"
  | "value"

export type ComponentName = "VPick" | "VPickNative"

export interface PropDoc {
  name: string
  type: string
  /** Effective default, which is not always the runtime one. See below. */
  default: string
  group: PropGroup
  components: ComponentName[]
  /** Inline markdown: `code`, **bold** and [links](/) all render. */
  description: string
  /** Page that explains it properly, when a sentence cannot. */
  more?: string
}

/**
 * The key adapters and `searchable` are `undefined` at runtime and resolve
 * further down. The effective value is what a reader needs, so that is listed.
 */
export const props: PropDoc[] = [
  // Core
  {
    name: "modelValue",
    type: "any",
    default: "undefined",
    group: "core",
    components: ["VPick", "VPickNative"],
    description:
      "Selected value. Use `v-model` for two-way binding. In Vue 2 the prop is `value`.",
  },
  {
    name: "options",
    type: "OptionOrGroup[]",
    default: "required",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "Array of options or option groups.",
    more: "/guide/data-shape",
  },
  {
    name: "placeholder",
    type: "string",
    default: "undefined",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "Text shown when no value is selected.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "Disables the control.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "Shows a spinner and disables interaction.",
  },
  {
    name: "error",
    type: "string",
    default: "undefined",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "Error message. Applies error styling and `aria-invalid`.",
  },
  {
    name: "id",
    type: "string",
    default: "undefined",
    group: "core",
    components: ["VPick", "VPickNative"],
    description:
      "HTML `id`, applied to the control itself so a `<label for>` resolves to it.",
    more: "/components/vpick/forms#labelling",
  },
  {
    name: "name",
    type: "string",
    default: "undefined",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "HTML `name` for form submission.",
    more: "/components/vpick/forms",
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "HTML `required` attribute.",
  },
  {
    name: "ariaLabel",
    type: "string",
    default: "undefined",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "`aria-label`, for when there is no visible label.",
  },
  {
    name: "ariaDescribedby",
    type: "string",
    default: "undefined",
    group: "core",
    components: ["VPick", "VPickNative"],
    description: "`aria-describedby`, for wiring up hint or error text.",
  },

  // Key adapters
  {
    name: "labelKey",
    type: "string | string[]",
    default: '"label"',
    group: "keys",
    components: ["VPick", "VPickNative"],
    description:
      "Key to read each option's visible label from. An array acts as a fallback chain: the first key with a non-empty value wins.",
    more: "/guide/data-shape",
  },
  {
    name: "valueKey",
    type: "string",
    default: '"value"',
    group: "keys",
    components: ["VPick", "VPickNative"],
    description: "Key to read each option's value from.",
    more: "/guide/data-shape",
  },
  {
    name: "disabledKey",
    type: "string",
    default: '"disabled"',
    group: "keys",
    components: ["VPick", "VPickNative"],
    description: "Key to read each option's disabled flag from.",
    more: "/guide/data-shape",
  },
  {
    name: "groupOptionsKey",
    type: "string",
    default: '"options"',
    group: "keys",
    components: ["VPick", "VPickNative"],
    description: "Key for the options array inside a group.",
    more: "/guide/data-shape",
  },
  {
    name: "childrenKey",
    type: "string",
    default: '"children"',
    group: "keys",
    components: ["VPick"],
    description:
      "Key for nested children. Any option carrying that array turns tree mode on.",
    more: "/components/vpick/tree-select",
  },

  // Appearance
  {
    name: "separators",
    type: "boolean",
    default: "false",
    group: "appearance",
    components: ["VPick"],
    description: "Draws a divider between adjacent groups in the list.",
  },
  {
    name: "rotateIcon",
    type: "boolean",
    default: "false",
    group: "appearance",
    components: ["VPick"],
    description: "Rotates the trigger chevron 180 degrees while open.",
  },
  {
    name: "animate",
    type: "boolean",
    default: "true",
    group: "appearance",
    components: ["VPick"],
    description:
      "Animates the multiselect chips. `false` adds and removes them outright.",
    more: "/components/vpick/multiselect#chip-motion",
  },

  // Search
  {
    name: "searchable",
    type: "boolean",
    default: "false",
    group: "search",
    components: ["VPick"],
    description:
      "Swaps the button trigger for an input with type-ahead filtering. No effect with `multiple`, which always uses that trigger.",
    more: "/components/vpick/search",
  },
  {
    name: "filter",
    type: "(option, query) => boolean",
    default: "undefined",
    group: "search",
    components: ["VPick"],
    description:
      "Replaces the built-in matcher. Receives each option and the current query.",
    more: "/components/vpick/search#custom-matching",
  },
  {
    name: "searchNested",
    type: "boolean",
    default: "false",
    group: "search",
    components: ["VPick"],
    description:
      "In tree mode, lets a multi-word query match across a node's ancestor path.",
    more: "/components/vpick/search#searching-across-the-ancestor-path",
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    group: "search",
    components: ["VPick"],
    description: "Shows a clear button once a value is selected.",
    more: "/components/vpick/search#clearable",
  },
  {
    name: "clearOnSelect",
    type: "boolean",
    default: "true",
    group: "search",
    components: ["VPick"],
    description: "Clears the search query after picking an option.",
    more: "/components/vpick/search#after-picking",
  },
  {
    name: "closeOnSelect",
    type: "boolean",
    default: "see description",
    group: "search",
    components: ["VPick"],
    description:
      "Closes the list after picking. Defaults to `true` in single-select and `false` in `multiple`; an explicit value applies to both.",
    more: "/components/vpick/search#after-picking",
  },
  {
    name: "searchKeys",
    type: "string | string[]",
    default: "undefined",
    group: "search",
    components: ["VPick"],
    description:
      "Extra fields on your option objects to search, alongside the label.",
    more: "/components/vpick/search#searching-other-fields",
  },
  {
    name: "fetchOptions",
    type: "(query: string, context: { signal?: AbortSignal }) => unknown[] | Promise<unknown[]>",
    default: "undefined",
    group: "search",
    components: ["VPick"],
    description:
      "Answers what the user types with options, from a server or an in-browser search engine, instead of filtering `options`.",
    more: "/components/vpick/search#searching-a-server",
  },
  {
    name: "searchDebounce",
    type: "number",
    default: "300",
    group: "search",
    components: ["VPick"],
    description:
      "Milliseconds to wait after the last keystroke before calling `fetchOptions`. `0` asks on every keystroke.",
    more: "/components/vpick/search#searching-a-server",
  },
  {
    name: "searchingText",
    type: "string",
    default: '"Searching..."',
    group: "search",
    components: ["VPick"],
    description: "Shown while `fetchOptions` is working on the typed query.",
    more: "/components/vpick/search#searching-a-server",
  },
  {
    name: "searchErrorText",
    type: "string",
    default: '"Could not search. Click to retry"',
    group: "search",
    components: ["VPick"],
    description: "Shown when `fetchOptions` rejects. Clicking it asks again.",
    more: "/components/vpick/search#searching-a-server",
  },
  {
    name: "searchPromptText",
    type: "string",
    default: '"Type to search"',
    group: "search",
    components: ["VPick"],
    description:
      "Shown with `fetchOptions` when nothing is typed and `options` is empty.",
    more: "/components/vpick/search#searching-a-server",
  },
  {
    name: "noResultsText",
    type: "string",
    default: '"No results"',
    group: "search",
    components: ["VPick"],
    description: "Shown when a search query matches nothing.",
    more: "/components/vpick/search#empty-states",
  },
  {
    name: "noOptionsText",
    type: "string",
    default: '"No options available"',
    group: "search",
    components: ["VPick"],
    description: "Shown when there are no options at all.",
    more: "/components/vpick/search#empty-states",
  },

  // Multiple
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    group: "multiple",
    components: ["VPick"],
    description:
      "Allows more than one selection. `v-model` becomes an array and the trigger draws chips.",
    more: "/components/vpick/multiselect",
  },
  {
    name: "backspaceRemoves",
    type: "boolean",
    default: "true",
    group: "multiple",
    components: ["VPick"],
    description: "`Backspace` on an empty search input removes the last chip.",
    more: "/components/vpick/multiselect#removing-chips",
  },
  {
    name: "deleteRemoves",
    type: "boolean",
    default: "true",
    group: "multiple",
    components: ["VPick"],
    description: "Same as `backspaceRemoves`, for the `Delete` key.",
    more: "/components/vpick/multiselect#removing-chips",
  },
  {
    name: "sortValueBy",
    type: '"ORDER_SELECTED" | "LEVEL" | "INDEX"',
    default: '"ORDER_SELECTED"',
    group: "multiple",
    components: ["VPick"],
    description: "Order of the emitted array and of the chips.",
    more: "/components/vpick/multiselect#ordering-selected-values",
  },

  // Tree
  {
    name: "defaultExpandLevel",
    type: "number",
    default: "undefined",
    group: "tree",
    components: ["VPick"],
    description:
      "Levels to pre-expand on open. `1` opens top-level branches, `2` opens two levels, and so on.",
    more: "/components/vpick/tree-select#expanding-on-open",
  },
  {
    name: "disableBranchNodes",
    type: "boolean",
    default: "false",
    group: "tree",
    components: ["VPick"],
    description:
      "Makes branches unselectable, so only leaves can be picked. Clicking a branch row expands it instead.",
    more: "/components/vpick/tree-select#unselectable-branches",
  },
  {
    name: "cascade",
    type: "boolean",
    default: "true",
    group: "tree",
    components: ["VPick"],
    description:
      "In `multiple` tree mode, selecting a branch selects its descendants. `false` gives independent nodes.",
    more: "/components/vpick/tree-select#cascade",
  },
  {
    name: "valueConsistsOf",
    type: '"LEAF_PRIORITY" | "ALL" | "BRANCH_PRIORITY" | "ALL_WITH_INDETERMINATE"',
    default: '"LEAF_PRIORITY"',
    group: "tree",
    components: ["VPick"],
    description: "Which nodes end up in `v-model` while `cascade` is active.",
    more: "/components/vpick/tree-select#valueconsistsof",
  },
  {
    name: "flattenSearchResults",
    type: "boolean",
    default: "false",
    group: "tree",
    components: ["VPick"],
    description:
      "Drops the ancestor rows and the indent from search results, leaving a flat list.",
    more: "/components/vpick/tree-select#flattening-search-results",
  },
  {
    name: "noChildrenText",
    type: "string",
    default: '"No sub-options"',
    group: "tree",
    components: ["VPick"],
    description:
      "Shown under an expanded branch whose `children` array is empty.",
    more: "/components/vpick/tree-select#branches-with-no-children",
  },
  {
    name: "loadChildren",
    type: "(option: unknown) => Promise<unknown[]>",
    default: "undefined",
    group: "tree",
    components: ["VPick"],
    description:
      "Fetches a branch's children when it first opens. Mark those branches with `children: null`.",
    more: "/components/vpick/tree-select#loading-children-on-demand",
  },
  {
    name: "loadingChildrenText",
    type: "string",
    default: '"Loading..."',
    group: "tree",
    components: ["VPick"],
    description: "Shown under a branch while its children load.",
    more: "/components/vpick/tree-select#loading-children-on-demand",
  },
  {
    name: "loadChildrenErrorText",
    type: "string",
    default: '"Could not load. Click to retry"',
    group: "tree",
    components: ["VPick"],
    description:
      "Shown under a branch whose children failed to load. Clicking it retries.",
    more: "/components/vpick/tree-select#loading-children-on-demand",
  },

  // Positioning
  {
    name: "teleportTo",
    type: "string | HTMLElement",
    default: "auto-detected",
    group: "positioning",
    components: ["VPick"],
    description:
      "Where the panel is rendered. Naming a target skips auto-detection; `<body>` is the fallback.",
    more: "/components/vpick/positioning",
  },
  {
    name: "strategy",
    type: '"auto" | "absolute" | "fixed"',
    default: '"auto"',
    group: "positioning",
    components: ["VPick"],
    description: "How the panel is anchored once it is rendered.",
    more: "/components/vpick/positioning#anchoring-and-scroll-containers",
  },
  {
    name: "hideWhenDetached",
    type: "boolean",
    default: "true",
    group: "positioning",
    components: ["VPick"],
    description: "Hides the panel while its trigger is scrolled out of view.",
    more: "/components/vpick/positioning#when-the-trigger-scrolls-away",
  },
  {
    name: "bodyLock",
    type: "boolean",
    default: "see description",
    group: "positioning",
    components: ["VPick"],
    description:
      "Locks scrolling while open. Unset, defaults to `true` in button mode and `false` in searchable mode.",
    more: "/components/vpick/positioning#scroll-lock",
  },
  {
    name: "alwaysOpen",
    type: "boolean",
    default: "false",
    group: "positioning",
    components: ["VPick"],
    description:
      "Renders the list inline in the page rather than as a dropdown. It cannot be closed.",
    more: "/components/vpick/positioning#always-open",
  },

  // Value
  {
    name: "valueFormat",
    type: '"id" | "object"',
    default: '"id"',
    group: "value",
    components: ["VPick"],
    description:
      "Whether `v-model` holds plain values or your original option objects.",
    more: "/components/vpick#object-values",
  },
]

export const vpickProps = props.filter((p) => p.components.includes("VPick"))

export const vpickNativeProps = props.filter((p) =>
  p.components.includes("VPickNative"),
)
