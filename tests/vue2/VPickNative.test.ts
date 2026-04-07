import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { VPickNative } from "../../src/vue2"
import type { OptionOrGroup } from "../../src/core"

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

describe("VPickNative (Vue 2)", () => {
  it("renders a select element", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status },
    })
    expect(wrapper.find("select").exists()).toBe(true)
  })

  it("renders flat options", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status },
    })
    const options = wrapper.findAll("option")
    expect(options).toHaveLength(3)
    expect(options.at(0)!.text()).toBe("Todo")
    expect(options.at(1)!.text()).toBe("In Progress")
    expect(options.at(2)!.text()).toBe("Done")
  })

  it("renders placeholder as disabled option", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status, placeholder: "Pick one..." },
    })
    const options = wrapper.findAll("option")
    expect(options).toHaveLength(4)
    expect(options.at(0)!.text()).toBe("Pick one...")
    expect(options.at(0)!.attributes("disabled")).toBeDefined()
  })

  it("renders option groups", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: departments },
    })
    const groups = wrapper.findAll("optgroup")
    expect(groups).toHaveLength(2)
    expect(groups.at(0)!.attributes("label")).toBe("Engineering")
    expect(groups.at(1)!.attributes("label")).toBe("Sales")
  })

  it("marks disabled options", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: departments },
    })
    const disabledOption = wrapper.find('option[value="account-manager"]')
    expect(disabledOption.attributes("disabled")).toBeDefined()
  })

  it("emits input on change (Vue 2 v-model)", async () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status, value: "todo" },
    })
    const select = wrapper.find("select")
    select.element.value = "done"
    await select.trigger("change")
    expect(wrapper.emitted("input")).toBeTruthy()
    expect(wrapper.emitted("input")![0]).toEqual(["done"])
  })

  it("sets the select value from value prop", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status, value: "in-progress" },
    })
    const select = wrapper.find("select")
    expect((select.element as HTMLSelectElement).value).toBe("in-progress")
  })

  it("applies disabled state", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status, disabled: true },
    })
    expect(wrapper.find("select").attributes("disabled")).toBeDefined()
    expect(wrapper.find(".vpick-native--disabled").exists()).toBe(true)
  })

  it("applies loading state", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status, loading: true },
    })
    expect(wrapper.find("select").attributes("disabled")).toBeDefined()
    expect(wrapper.find(".vpick-native--loading").exists()).toBe(true)
    expect(wrapper.find(".vpick-native-spinner").exists()).toBe(true)
  })

  it("shows chevron icon when not loading", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status },
    })
    expect(wrapper.find(".vpick-native-spinner").exists()).toBe(false)
    expect(wrapper.find(".vpick-native-icon").exists()).toBe(true)
  })

  it("applies error state", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status, error: "Required" },
    })
    expect(wrapper.find(".vpick-native--error").exists()).toBe(true)
    expect(wrapper.find("select").attributes("aria-invalid")).toBe("true")
  })

  it("passes id, name, required attributes", () => {
    const wrapper = mount(VPickNative, {
      propsData: {
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
      propsData: {
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
      propsData: { options: status, size: "sm" },
    })
    expect(wrapper.find(".vpick-native--sm").exists()).toBe(true)
  })

  it("renders custom icon slot", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status },
      slots: { icon: "<span class='custom-icon'>V</span>" },
    })
    expect(wrapper.find(".custom-icon").exists()).toBe(true)
  })

  it("renders custom loading slot", () => {
    const wrapper = mount(VPickNative, {
      propsData: { options: status, loading: true },
      slots: { loading: "<span class='custom-loader'>...</span>" },
    })
    expect(wrapper.find(".custom-loader").exists()).toBe(true)
  })
})
