import type { OptionOrGroup } from "../src/core"

export const status: OptionOrGroup[] = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
  { label: "Cancelled", value: "cancelled" },
]

export const departments: OptionOrGroup[] = [
  {
    label: "Engineering",
    options: [
      { label: "Frontend", value: "frontend" },
      { label: "Backend", value: "backend" },
      { label: "DevOps", value: "devops" },
    ],
  },
  {
    label: "Sales",
    options: [
      { label: "Sales Rep", value: "sales-rep" },
      { label: "Account Manager", value: "account-manager" },
      { label: "Sales Director", value: "sales-director", disabled: true },
    ],
  },
]

export const timezones: OptionOrGroup[] = [
  {
    label: "North America",
    options: [
      { label: "Eastern Standard Time", value: "est" },
      { label: "Central Standard Time", value: "cst" },
      { label: "Mountain Standard Time", value: "mst" },
      { label: "Pacific Standard Time", value: "pst" },
      { label: "Alaska Standard Time", value: "akst" },
      { label: "Hawaii Standard Time", value: "hst" },
    ],
  },
  {
    label: "Europe & Africa",
    options: [
      { label: "Greenwich Mean Time", value: "gmt" },
      { label: "Central European Time", value: "cet" },
      { label: "Eastern European Time", value: "eet" },
      { label: "Western European Summer Time", value: "west" },
      { label: "Central Africa Time", value: "cat" },
      { label: "East Africa Time", value: "eat" },
    ],
  },
  {
    label: "Asia",
    options: [
      { label: "Moscow Time", value: "msk" },
      { label: "India Standard Time", value: "ist" },
      { label: "China Standard Time", value: "cst_china" },
      { label: "Japan Standard Time", value: "jst" },
      { label: "Korea Standard Time", value: "kst" },
      { label: "Indonesia Central Standard Time", value: "ist_indonesia" },
    ],
  },
  {
    label: "Australia & Pacific",
    options: [
      { label: "Australian Western Standard Time", value: "awst" },
      { label: "Australian Central Standard Time", value: "acst" },
      { label: "Australian Eastern Standard Time", value: "aest" },
      { label: "New Zealand Standard Time", value: "nzst" },
      { label: "Fiji Time", value: "fjt" },
    ],
  },
  {
    label: "South America",
    options: [
      { label: "Argentina Time", value: "art" },
      { label: "Bolivia Time", value: "bot" },
      { label: "Brasilia Time", value: "brt" },
      { label: "Chile Standard Time", value: "clt" },
    ],
  },
]

export const options = [
  { label: "Australia", value: "au" },
  { label: "Brazil", value: "br" },
  { label: "Canada", value: "ca" },
  { label: "Denmark", value: "dk" },
  { label: "Egypt", value: "eg" },
  { label: "France", value: "fr" },
  { label: "Germany", value: "de" },
  { label: "Indonesia", value: "id" },
  { label: "Japan", value: "jp" },
  { label: "Malaysia", value: "my" },
  { label: "Norway", value: "no" },
  { label: "Poland", value: "pl" },
  { label: "Spain", value: "es" },
  { label: "Thailand", value: "th" },
  { label: "Vietnam", value: "vn" },
]

export const dataOptions = [
  { label: "Countries", value: "countries" },
  { label: "Timezones", value: "timezones" },
]

export const treeOptions = [
  {
    label: "Electronics",
    value: "electronics",
    children: [
      { label: "Phones", value: "phones" },
      {
        label: "Laptops",
        value: "laptops",
        children: [
          { label: "Gaming", value: "gaming" },
          { label: "Business", value: "business" },
          { label: "Ultrabooks", value: "ultrabooks" },
        ],
      },
      { label: "Tablets", value: "tablets" },
    ],
  },
  {
    label: "Clothing",
    value: "clothing",
    children: [
      {
        label: "Men",
        value: "men",
        children: [
          // Deliberately deep: this chain reaches depth 5 so the indent, the
          // chevron/checkbox alignment and label ellipsis can be eyeballed
          // where they are worst.
          {
            label: "Shirts",
            value: "shirts",
            children: [
              {
                label: "Casual",
                value: "shirts-casual",
                children: [
                  {
                    label: "Linen",
                    value: "shirts-casual-linen",
                    children: [
                      { label: "Slim fit", value: "shirts-casual-linen-slim" },
                      {
                        label: "Regular fit",
                        value: "shirts-casual-linen-regular",
                      },
                    ],
                  },
                  { label: "Oxford", value: "shirts-casual-oxford" },
                ],
              },
              { label: "Formal", value: "shirts-formal" },
            ],
          },
          { label: "Pants", value: "pants" },
        ],
      },
      {
        label: "Women",
        value: "women",
        children: [
          { label: "Dresses", value: "dresses" },
          { label: "Tops", value: "tops" },
        ],
      },
    ],
  },
  // Explicit empty children: a branch that currently has nothing under it.
  // Expand it to see `noChildrenText`. Contrast with Books/Sports below, which
  // omit the key entirely and are therefore leaves.
  { label: "Archived", value: "archived", children: [] },
  { label: "Books", value: "books" },
  { label: "Sports", value: "sports" },
]
