---
title: Search engines
description: Plug any search engine into VPick. Fuzzy search, full-text search in the browser, or a server, with its ranking kept.
---

# Search engines

VPick's built-in search matches text in the label, and in any
[`searchKeys`](/components/vpick/search#searching-other-fields) you name. When
you need more, such as typo tolerance, relevance ranking or searching long
descriptions, plug in a search engine through
[`fetchOptions`](/components/vpick/search#searching-a-server).

`fetchOptions` receives what the user typed and returns the matching options.
VPick shows them in the order they come back, so the engine's ranking is kept,
and handles the rest: waiting for typing to pause, cancelling stale requests,
the searching and error rows, and keeping picked options after the results
change.

## Pick your engine

<div class="engine-cards">
  <a class="engine-card" href="/search-engines/fuse">
    <strong>Fuse.js</strong>
    <span>Fuzzy search in the browser. Forgives typos, ranks the closest matches first.</span>
  </a>
  <a class="engine-card" href="/search-engines/flexsearch">
    <strong>FlexSearch</strong>
    <span>Full-text search in the browser. Several fields, partial words, relevance ranking.</span>
  </a>
  <a class="engine-card" href="/search-engines/server">
    <strong>Your server</strong>
    <span>Any backend: Meilisearch, Algolia, a database. The search runs where the data is.</span>
  </a>
</div>

## Which one

| You have                                                  | Use                                           |
| --------------------------------------------------------- | --------------------------------------------- |
| A few thousand short labels, and people misspell them     | [Fuse.js](/search-engines/fuse)               |
| Records with longer text, such as titles and descriptions | [FlexSearch](/search-engines/flexsearch)      |
| More data than belongs in the page, or it changes often   | [Your server](/search-engines/server)         |
| Short labels, spelled right                               | Nothing extra. The built-in search is enough. |

VPick has no dependencies of its own, and none of these become one. You install
the engine you choose in your app.
