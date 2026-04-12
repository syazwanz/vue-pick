import { defineConfig } from "vitepress"
import { fileURLToPath, URL } from "node:url"

const year = new Date().getFullYear()

export default defineConfig({
  title: "VuePick",
  description: "Accessible select components for Vue 2.7 and Vue 3.",
  base: "/vue-pick/",
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  ],

  themeConfig: {
    nav: [
      { text: "Docs", link: "/guide/introduction" },
      { text: "Components", link: "/components/vpick-native" },
      {
        text: "v0.2.1",
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
          { text: "Theming", link: "/guide/theming" },
        ],
      },
      {
        text: "Components",
        items: [
          { text: "VPickNative", link: "/components/vpick-native" },
          { text: "VPick", link: "/components/vpick" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/syazwanz/vue-pick" },
    ],

    search: {
      provider: "local",
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
