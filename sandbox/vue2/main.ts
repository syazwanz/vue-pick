// @ts-expect-error - Vue 2 types don't match Vue 3 resolver
import Vue from "vue"
import App from "./App.vue"

// @ts-expect-error - Vue 2 render function
new Vue({ render: (h) => h(App) }).$mount("#app")
