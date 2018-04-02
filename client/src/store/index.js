import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";
import axios from "axios";
import config from "../config";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // login state
    login: false,

    // dev state
    full_addr: "",
    full_api_addr: "",

    // chat state
    socket: null,
    chat_id: null,
    messages: []
  },
  mutations: {
    // setup url
    setup(state) {
      state.full_addr = `${config.http}://${
        config.dev ? config.dev_url : config.prod_url
        }:${config.port}`;
      state.full_api_addr = `${state.full_addr}${config.api_addr}`;
    },

    // connects to socket when loggedin
    login(state) {
      state.socket = io(state.full_addr);
      state.socket.on("chat", data => {
        state.messages.push(data);
      });
      state.login = true;
    },

    logout(state) {
      state.login = false;
    }
  },
  actions: {
    // authencitate user with current token stored in local storage, return the user information
    auth({ commit, state }) {
      return axios({
        method: "get",
        url: state.full_api_addr + "/user",
        headers: {
          Authorization: window.localStorage.getItem("token")
        }
      });
    },

    // register with give username and password
    register({ commit, state }, data) {
      return axios({
        method: "post",
        url: state.full_api_addr + "/user",
        data: data
      });
    },

    // login a user
    login({ commit, state }, data) {
      return axios({
        method: "post",
        url: state.full_api_addr + "/login",
        data: data
      });
    }
  },
  getters: {
    getUrl(state) {
      return state.dev ? state.dev_url : state.prod_url;
    },
    getChatId(state) {
      return null == state.socket ? 0 : state.socket.id;
    },
    getMsgs(state) {
      return state.messages;
    },
    loggedIn(state) {
      return state.login;
    },
    loggedOut(state) {
      return !state.login;
    }
  }
});
