// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import router from "./router";
import store from "./store";
import App from "./App";
import VueChatScroll from 'vue-chat-scroll'

Vue.use(VueChatScroll)
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  store,
  router,
  components: { App },
  template: "<App/>",
  beforeCreate: function() {
    let bootstrap_css = document.createElement('link');
    bootstrap_css.setAttribute('rel', 'stylesheet');
    bootstrap_css.setAttribute('href', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css');
    bootstrap_css.setAttribute('integrity', 'sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm');
    bootstrap_css.setAttribute('crossorigin', 'anonymous');
    document.head.appendChild(bootstrap_css);
  },
});