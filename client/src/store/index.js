import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";
import axios from "axios";
import config from "../config";
import { router } from "../router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // login state
    login: false,
    username: "",

    // dev state
    full_addr: "",
    full_api_addr: "",

    // chat state
    socket: null,
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
    },

    setMyMsg(state, myMsg) {
      state.messages.push("Me:");
      state.messages.push(myMsg);
    },

    sendMsg(state, msg) {
      state.socket.emit("newMsg", msg);
    },

    // simply changes the status and resets message
    logout(state) {
      window.localStorage.removeItem("token");
      state.login = false;
      state.messages = [];
      state.socket.close();
    }
  },
  actions: {
    // authencitate user with current token stored in local storage, return the user information
    async auth({ dispatch, commit, state }) {
      await axios({
        method: "get",
        url: state.full_api_addr + "/user",
        headers: {
          Authorization: window.localStorage.getItem("token")
        }
      });

      commit('login');
      dispatch("handleSocket");
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
    async login({ dispatch, commit, state }, data) {
      // sends login to RESTful API, if fails, abort
      let response = await axios({
        method: "post",
        url: state.full_api_addr + "/login",
        data: data
      });

      // saves the token locally, change the status of login
      state.username = data.username;
      window.localStorage.setItem("token", response.data.token);
      commit('login');
      dispatch("handleSocket");
    },

    handleSocket({ commit, state }) {
      // opens up a socket
      state.socket = io(state.full_addr, { forceNew: false });
      state.socket.on("connect", () => {
        state.socket.emit("sendToken", window.localStorage.getItem("token"));
      });

      state.socket.on("joined", () => {
        // handle what to do after joined
        // alert("successfuly changed online status");
      });

      state.socket.on("msg", (id, data) => {
        state.messages.push(id + " says:");
        state.messages.push(data);
      });

      state.socket.on("reconnect", () => {
        alert("重新连上了!");
        state.socket.emit("sendToken", window.localStorage.getItem("token"), true);
      });

      state.socket.on("reconnect_error", () => {
        alert("SOME SHIT HAPPENED");
      });

      state.socket.on("kickout", (reason) => {
        alert(reason);
        state.socket.close();
        commit("logout");
        router.push("/");
      });
    }
  },
  getters: {
    getUrl(state) {
      return state.dev ? state.dev_url : state.prod_url;
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
