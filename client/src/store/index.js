import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // login state
    login: false,

    // dev state
    dev: true,
    dev_url: "localhost",
    prod_url: "45.32.65.216",
    port: "1234",
    api_addr: "/api/v1",

    // chat state
    socket: null,
    chat_id: null,
    messages: []
  },
  mutations: {
    login(state) {
      // connects to socket when loggedin
      state.socket = io.connect(
        `https://${state.dev ? state.dev_url : state.prod_url}:${state.port}`
      );
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
        url: `https://${state.dev ? state.dev_url : state.prod_url}:${state.port}${state.api_addr}/user`,
        headers: {
          Authorization: window.localStorage.getItem("token")
        }
      });
    },

    // receieves a chat_id from server and sends back
    sendChatId({ commit, state }) {
      state.socket.on("UPDATE_USER_INFO", data => {
        if ("PING" == data) {
          console.log('GOT SOME DATA')
          return axios({
            method: "put",
            url: `https://${state.dev ? state.dev_url : state.prod_url}:${state.port}${state.api_addr}/user`,
            headers: {
              Authorization: window.localStorage.getItem("token")
            },
            body: {
              is_online: true,
              chat_id: state.socket.id
            }
          });
        }
      });
    },

    // connects to chat socket
    connectChat({ commit, state }) {
      return state.socket.on("chat", data => {
        state.messages.push(data);
      });
    }
  },
  getters: {
    getUrl(state) {
      return state.dev ? state.dev_url : state.prod_url;
    },
    getChatId(state) {
      return (null == state.socket) ? 0 : state.socket.id;
    },
    getMsgs(state) {
      return state.messages;
    },
    getLogin(state) {
      return !state.login;
    },
    getLogout(state) {
      return state.login;
    }
  }
});
