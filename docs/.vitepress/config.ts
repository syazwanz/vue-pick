import { defineConfig } from "vitepress"
import { fileURLToPath, URL } from "node:url"
import pkg from "../../package.json" with { type: "json" }

const year = new Date().getFullYear()
const hostname = "https://vue-pick.js.org"
const siteTitle = "Vue Pick"
const siteDescription =
  "Accessible select components for Vue 2.7 and Vue 3. Lightweight and zero-dependency, with a styled native-select wrapper and a fully custom dropdown featuring full keyboard navigation and ARIA support."
const ogImage = `${hostname}/hero.webp`

export default defineConfig({
  title: siteTitle,
  titleTemplate: ":title | Vue Pick",
  description: siteDescription,
  base: "/",
  cleanUrls: true,
  lastUpdated: true,
  // The component ships no dark theme, so a dark site would frame every live
  // example in colours it was never designed against. Drop this once the
  // stylesheet has a dark palette.
  appearance: false,
  sitemap: {
    hostname,
  },
  head: [
    [
      "link",
      { rel: "icon", type: "image/webp", sizes: "32x32", href: "/icon.webp" },
    ],
    [
      "link",
      { rel: "icon", type: "image/webp", sizes: "16x16", href: "/icon.webp" },
    ],
    ["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/icon.webp" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "vue pick, vue select, vue 3 select, vue 2 select, vue dropdown component, accessible select vue, vue combobox, vue 2.7 select, headless select vue, aria select vue, keyboard navigation select vue, typed vue select, zero dependency vue select",
      },
    ],
    ["meta", { name: "author", content: "syazwanz" }],
    // The green from the logo, not a near-miss from a utility palette.
    ["meta", { name: "theme-color", content: "#41b883" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: siteTitle }],
    ["meta", { property: "og:title", content: siteTitle }],
    ["meta", { property: "og:description", content: siteDescription }],
    ["meta", { property: "og:url", content: hostname }],
    ["meta", { property: "og:image", content: ogImage }],
    [
      "meta",
      {
        property: "og:image:alt",
        content:
          "Vue Pick, an accessible select component library for Vue 2.7 and Vue 3",
      },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: siteTitle }],
    ["meta", { name: "twitter:description", content: siteDescription }],
    ["meta", { name: "twitter:image", content: ogImage }],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: "Vue Pick",
        description: siteDescription,
        codeRepository: "https://github.com/syazwanz/vue-pick",
        programmingLanguage: ["TypeScript", "Vue"],
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        license: "https://opensource.org/licenses/MIT",
        url: hostname,
        author: {
          "@type": "Person",
          name: "syazwanz",
          url: "https://github.com/syazwanz",
        },
        keywords:
          "Vue, Vue 3, Vue 2.7, select, dropdown, combobox, accessible, ARIA, keyboard navigation, form component, TypeScript",
      }),
    ],
  ],
  transformHead({ pageData, siteData }) {
    const tags: [string, Record<string, string>][] = []
    const relativePath = pageData.relativePath
      .replace(/(^|\/)index\.md$/, "$1")
      .replace(/\.md$/, "")
    const canonical =
      `${hostname}/${relativePath}`.replace(/\/$/, "") || hostname

    tags.push(["link", { rel: "canonical", href: canonical }])

    const pageTitle =
      pageData.frontmatter.title || pageData.title || siteData.title
    const pageDescription =
      pageData.frontmatter.description ||
      pageData.description ||
      siteData.description

    tags.push(["meta", { property: "og:title", content: pageTitle }])
    tags.push([
      "meta",
      { property: "og:description", content: pageDescription },
    ])
    tags.push(["meta", { property: "og:url", content: canonical }])
    tags.push(["meta", { name: "twitter:title", content: pageTitle }])
    tags.push([
      "meta",
      { name: "twitter:description", content: pageDescription },
    ])

    return tags
  },
  themeConfig: {
    logo: "/icon.webp",
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      {
        text: "VPickNative",
        link: "/components/vpick-native",
        activeMatch: "/components/vpick-native",
      },
      {
        text: "VPick",
        link: "/components/vpick",
        activeMatch: "/components/vpick/",
      },
      {
        text: `v${pkg.version}`,
        items: [
          {
            text: "Changelog",
            link: "https://github.com/syazwanz/vue-pick/blob/main/CHANGELOG.md",
          },
          { text: "npm", link: "https://www.npmjs.com/package/vue-pick" },
        ],
      },
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Installation", link: "/guide/installation" },
          { text: "Data Shape", link: "/guide/data-shape" },
          { text: "Theming", link: "/guide/theming" },
        ],
      },
      // VPickNative first: it is the simpler of the two and the one to reach
      // for by default, so the sidebar reads in the order someone should
      // consider them rather than by how much documentation each has.
      {
        text: "VPickNative",
        items: [
          { text: "Overview", link: "/components/vpick-native" },
          { text: "Forms", link: "/components/vpick-native/forms" },
          {
            text: "Accessibility",
            link: "/components/vpick-native/accessibility",
          },
          { text: "API Reference", link: "/components/vpick-native/api" },
        ],
      },
      {
        text: "VPick",
        items: [
          { text: "Overview", link: "/components/vpick" },
          { text: "Search", link: "/components/vpick/search" },
          { text: "Multiselect", link: "/components/vpick/multiselect" },
          { text: "Tree Select", link: "/components/vpick/tree-select" },
          { text: "Slots", link: "/components/vpick/slots" },
          { text: "Positioning", link: "/components/vpick/positioning" },
          { text: "Forms", link: "/components/vpick/forms" },
          { text: "Accessibility", link: "/components/vpick/accessibility" },
          { text: "API Reference", link: "/components/vpick/api" },
        ],
      },
      {
        text: "Search engines",
        items: [
          { text: "Overview", link: "/search-engines/" },
          { text: "Fuse.js", link: "/search-engines/fuse" },
          { text: "FlexSearch", link: "/search-engines/flexsearch" },
          { text: "Your server", link: "/search-engines/server" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/syazwanz/vue-pick" },
    ],
    search: {
      provider: "algolia",
      options: {
        appId: "2T7JT1OEUY",
        apiKey: "89abee0032df711bcc4f74da958034b9",
        indexName: "VuePick Docs Crawler",
      },
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © ${year}`,
    },
    editLink: {
      pattern: "https://github.com/syazwanz/vue-pick/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
  vite: {
    resolve: {
      alias: {
        "vue-pick": fileURLToPath(
          new URL("../../src/vue3/index.ts", import.meta.url),
        ),
      },
    },
  },
})
