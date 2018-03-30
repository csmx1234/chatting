import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // login state
    login: false,

    // dev state
    dev: true,
    dev_url: "localhost",
    prod_url: "45.32.65.216",

    // chat state
    socket: null
  },
  mutations: {
    login(state) {
      state.socket = io.connect(
        `https://${state.dev ? state.dev_url : state.prod_url}:1234`
      );

      state.login = true;
    },
    logout(state) {
      state.login = false;
    }
  },
  getters: {
    getUrl(state) {
      return state.dev ? state.dev_url : state.prod_url;
    },
    getChatId(state) {
      return 0;
    },
    getLogin(state) {
      return !state.login;
    },
    getLogout(state) {
      return state.login;
    }
  }
});
