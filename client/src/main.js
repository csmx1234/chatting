// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import { router } from "./router";
import store from "./store";
import App from "./App";
import VueChatScroll from 'vue-chat-scroll';
import VueKonva from 'vue-konva'

Vue.use(VueKonva);
Vue.use(VueChatScroll);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  store,
  router,
  components: { App },
  template: "<App/>",
});