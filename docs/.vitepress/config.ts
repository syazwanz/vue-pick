import { defineConfig } from "vitepress"
import { fileURLToPath, URL } from "node:url"

const year = new Date().getFullYear()

export default defineConfig({
  title: "<Vue-Pick/>",
  description: "Accessible select components for Vue 2.7 and Vue 3.",
  base: "/",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/webp",
        sizes: "32x32",
        href: "/icon.webp",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/webp",
        sizes: "16x16",
        href: "/icon.webp",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/icon.webp",
      },
    ],
  ],
  themeConfig: {
    logo: "/icon.webp",
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
