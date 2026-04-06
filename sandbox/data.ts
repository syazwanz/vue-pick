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
