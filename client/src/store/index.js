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
      state.login = true;
      state.socket = io(state.full_addr);
      state.socket.on("msg", (id, data) => {
        console.log("something happened");
        state.messages.push(id + " says:");
        state.messages.push(data);
      });
      state.socket.on("data", data => {
        // setup chatid with server
        if (null == state.chat_id) {
          state.chat_id = state.socket.id
          state.socket.emit("data", state.socket.id, "PONG");
          axios({
            method: "put",
            url: state.full_api_addr + "/user",
            headers: {
              Authorization: window.localStorage.getItem("token")
            },
            data: {
              is_online: true,
              chat_id: state.chat_id
            }
          });
        }
      });

    },

    // simply changes the status and resets message
    logout(state) {
      window.localStorage.removeItem("token");
      state.login = false;
      state.chat_id = null;
      state.socket.close();
      state.messages = [];
    }
  },
  actions: {
    // authencitate user with current token stored in local storage, return the user information
    async auth({ state }) {
      await axios({
        method: "get",
        url: state.full_api_addr + "/user",
        headers: {
          Authorization: window.localStorage.getItem("token")
        }
      });
    },

    // register with give username and password
    async register({ state }, data) {
      let response = await axios({
        method: "post",
        url: state.full_api_addr + "/user",
        data: data
      });
      alert(response.data.message);
    },

    // login a user
    async login({ commit, state }, data) {
      let response = await axios({
        method: "post",
        url: state.full_api_addr + "/login",
        data: data
      });

      window.localStorage.setItem("token", response.data.token);
      commit('login');
    },

    // tell server this person going offline
    async goOffline({ state }) {
      await axios({
        method: "put",
        url: state.full_api_addr + "/user",
        headers: {
          Authorization: window.localStorage.getItem("token")
        },
        data: {
          is_online: false,
          chat_id: null
        }
      });
    },

    // logout
    async logout({ dispatch, commit, state }) {
      await dispatch("goOffline");
      commit("logout");
    }
  },
  getters: {
    getUrl(state) {
      return state.dev ? state.dev_url : state.prod_url;
    },
    getChatId(state) {
      return state.chat_id;
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
