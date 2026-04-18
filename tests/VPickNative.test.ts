import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { VPickNative } from "../src/vue3"
import type { OptionOrGroup } from "../src/core"

const status: OptionOrGroup[] = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
]

const departments: OptionOrGroup[] = [
  {
    label: "Engineering",
    options: [
      { label: "Frontend", value: "frontend" },
      { label: "Backend", value: "backend" },
    ],
  },
  {
    label: "Sales",
    options: [
      { label: "Sales Rep", value: "sales-rep" },
      { label: "Account Manager", value: "account-manager", disabled: true },
    ],
  },
]

describe("VPickNative", () => {
  it("renders a select element", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status },
    })
    expect(wrapper.find("select").exists()).toBe(true)
  })

  it("renders flat options", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status },
    })
    const options = wrapper.findAll("option")
    expect(options).toHaveLength(3)
    expect(options[0].text()).toBe("Todo")
    expect(options[1].text()).toBe("In Progress")
    expect(options[2].text()).toBe("Done")
  })

  it("renders placeholder as disabled option", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status, placeholder: "Pick one..." },
    })
    const options = wrapper.findAll("option")
    expect(options).toHaveLength(4)
    expect(options[0].text()).toBe("Pick one...")
    expect(options[0].attributes("disabled")).toBeDefined()
  })

  it("renders option groups", () => {
    const wrapper = mount(VPickNative, {
      props: { options: departments },
    })
    const groups = wrapper.findAll("optgroup")
    expect(groups).toHaveLength(2)
    expect(groups[0].attributes("label")).toBe("Engineering")
    expect(groups[1].attributes("label")).toBe("Sales")
    expect(groups[0].findAll("option")).toHaveLength(2)
    expect(groups[1].findAll("option")).toHaveLength(2)
  })

  it("marks disabled options", () => {
    const wrapper = mount(VPickNative, {
      props: { options: departments },
    })
    const disabledOption = wrapper.find('option[value="account-manager"]')
    expect(disabledOption.attributes("disabled")).toBeDefined()
  })

  it("emits update:modelValue on change", async () => {
    const wrapper = mount(VPickNative, {
      props: { options: status, modelValue: "todo" },
    })
    const select = wrapper.find("select")
    await select.setValue("done")
    expect(wrapper.emitted("update:modelValue")).toBeTruthy()
    expect(wrapper.emitted("update:modelValue")![0]).toEqual(["done"])
  })

  it("sets the select value from modelValue", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status, modelValue: "in-progress" },
    })
    const select = wrapper.find("select")
    expect(select.element.value).toBe("in-progress")
  })

  it("applies disabled state", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status, disabled: true },
    })
    expect(wrapper.find("select").attributes("disabled")).toBeDefined()
    expect(wrapper.find(".vpick-native--disabled").exists()).toBe(true)
  })

  it("applies loading state", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status, loading: true },
    })
    expect(wrapper.find("select").attributes("disabled")).toBeDefined()
    expect(wrapper.find(".vpick-native--loading").exists()).toBe(true)
    expect(wrapper.find(".vpick-native-spinner").exists()).toBe(true)
  })

  it("shows chevron icon when not loading", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status },
    })
    expect(wrapper.find(".vpick-native-spinner").exists()).toBe(false)
    expect(wrapper.find(".vpick-native-icon").exists()).toBe(true)
  })

  it("applies error state", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status, error: "Required" },
    })
    expect(wrapper.find(".vpick-native--error").exists()).toBe(true)
    expect(wrapper.find("select").attributes("aria-invalid")).toBe("true")
  })

  it("passes id, name, required attributes", () => {
    const wrapper = mount(VPickNative, {
      props: {
        options: status,
        id: "my-select",
        name: "status",
        required: true,
      },
    })
    const select = wrapper.find("select")
    expect(select.attributes("id")).toBe("my-select")
    expect(select.attributes("name")).toBe("status")
    expect(select.attributes("required")).toBeDefined()
  })

  it("passes aria attributes", () => {
    const wrapper = mount(VPickNative, {
      props: {
        options: status,
        ariaLabel: "Status select",
        ariaDescribedby: "help-text",
      },
    })
    const select = wrapper.find("select")
    expect(select.attributes("aria-label")).toBe("Status select")
    expect(select.attributes("aria-describedby")).toBe("help-text")
  })

  it("applies size class", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status, size: "sm" },
    })
    expect(wrapper.find(".vpick-native--sm").exists()).toBe(true)
  })

  it("renders custom icon slot", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status },
      slots: { icon: "<span class='custom-icon'>V</span>" },
    })
    expect(wrapper.find(".custom-icon").exists()).toBe(true)
  })

  it("renders custom loading slot", () => {
    const wrapper = mount(VPickNative, {
      props: { options: status, loading: true },
      slots: { loading: "<span class='custom-loader'>...</span>" },
    })
    expect(wrapper.find(".custom-loader").exists()).toBe(true)
  })

  describe("custom keys", () => {
    const users = [
      { id: 1, name: "Alice", inactive: false },
      { id: 2, name: "Bob", inactive: true },
    ]

    it("renders labels via labelKey and matches values via valueKey", () => {
      const wrapper = mount(VPickNative, {
        props: {
          options: users,
          labelKey: "name",
          valueKey: "id",
          modelValue: 2,
        },
      })
      const options = wrapper.findAll("option")
      expect(options.map((o) => o.text())).toEqual(["Alice", "Bob"])
      expect(wrapper.find("select").element.value).toBe("2")
    })

    it("emits value from valueKey on change", async () => {
      const wrapper = mount(VPickNative, {
        props: { options: users, labelKey: "name", valueKey: "id" },
      })
      const select = wrapper.find("select")
      await select.setValue("1")
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([1])
    })

    it("applies disabledKey to individual options", () => {
      const wrapper = mount(VPickNative, {
        props: {
          options: users,
          labelKey: "name",
          valueKey: "id",
          disabledKey: "inactive",
        },
      })
      const bob = wrapper.find('option[value="2"]')
      expect(bob.attributes("disabled")).toBeDefined()
    })

    it("detects groups via groupOptionsKey", () => {
      const regions = [
        {
          name: "Americas",
          members: [
            { id: "us", name: "United States" },
            { id: "ca", name: "Canada" },
          ],
        },
      ]
      const wrapper = mount(VPickNative, {
        props: {
          options: regions,
          labelKey: "name",
          valueKey: "id",
          groupOptionsKey: "members",
        },
      })
      const groups = wrapper.findAll("optgroup")
      expect(groups).toHaveLength(1)
      expect(groups[0].attributes("label")).toBe("Americas")
      expect(groups[0].findAll("option")).toHaveLength(2)
    })
  })
})
