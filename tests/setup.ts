import { config } from "@vue/test-utils"
import { defineComponent, h } from "vue"

// Render Teleport contents in-place so wrapper.find(...) reaches them.
// Portal behavior is covered by a dedicated test file.
config.global.stubs = {
  Teleport: defineComponent({
    props: {
      to: { type: [String, Object], default: "body" },
      disabled: { type: Boolean, default: false },
    },
    setup(_, { slots }) {
      return () => h("div", { "data-teleport-stub": true }, slots.default?.())
    },
  }),
}
