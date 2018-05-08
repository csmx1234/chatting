import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";
import axios from "axios";
import moment from "moment";
import { router } from "../router";
import config from "../config";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // login state
    user_count: 0,
    login: false,
    connected: false,
    chatting: false,
    matching: false,
    username: "",
    fresh_start: true,

    // dev state
    full_addr: "",
    full_api_addr: "",

    // chat state
    socket: null,
    chat_id: null,
    partner_online: false,
    partner: {},
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
      state.socket.emit("new_message", msg);
    },

    getNewMatch(state, gender) {
      state.partner = {};
      state.messages = [];
      state.matching = true;
      if (gender == config.MALE) {
        state.socket.emit("new_match", config.MALE);
      } else if (gender == config.FEMALE) {
        state.socket.emit("new_match", config.FEMALE);
      } else {
        state.socket.emit("new_match", config.RANDOM);
      }
    },

    cancelMatch(state) {
      state.partner = {};
      state.messages = [];
      state.matching = false;
      state.socket.emit("cancel_match");
    },

    leaveRoom(state) {
      state.chatting = false;
      state.socket.emit("leaving_room");
    },

    // simply changes the status and resets message
    logout(state) {
      window.localStorage.removeItem("token");
      state.user_count = 0;
      state.login = false;
      state.connected = false;
      state.chatting = false;
      state.matching = false;
      state.username = "";
      state.fresh_start = true;

      // chat state
      state.chat_id = null;
      state.partner_online = false;
      state.partner = {};
      state.messages = [];
      state.socket.close();
      state.socket = null;
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
        state.socket.emit("send_token", window.localStorage.getItem("token"), true);
        state.chat_id = state.socket.id;
      });

      state.socket.on("user_count", count => {
        state.user_count = count;
      });

      state.socket.on("joined", () => {
        // handle what to do after joined
        state.connected = true;
      });

      state.socket.on("message", (id, data) => {
        state.messages.push(id + " says:");
        state.messages.push(data);
      });

      state.socket.on("reconnect", () => {
        alert("重新连上了!");
        state.socket.emit("send_token", window.localStorage.getItem("token"));
        if (state.matching)
          state.matching = false;
      });

      state.socket.on("reconnecting", () => {
        alert("重新连接中...");
        state.connected = false;
      });

      state.socket.on("disconnecting", (reason) => {
        state.connected = false;
      });

      state.socket.on("disconnect", (reason) => {
        state.connected = false;
      });

      state.socket.on("reconnect_error", () => {
        alert("SOME SHIT HAPPENED");
      });

      state.socket.on("kick_out", (reason) => {
        state.socket.close();
        commit("logout");
        alert(reason);
        router.push("/");
      });

      state.socket.on("new_match", (partner) => {
        // boundary check
        if (!state.matching && !state.fresh_start) {
          console.log("Err: user is not trying to match");
          return;
        }
        if (state.fresh_start) {
          state.fresh_start = false;
        }
        state.matching = false;
        state.chatting = true;
        state.partner = partner;
      });

      state.socket.on("i_left_room", () => {
      });

      state.socket.on("partner_left_room", () => {
        state.matching = false;
        state.chatting = false;
        state.socket.emit("leaving_room");
        state.messages.push("Partner has left the room");
      });

      state.socket.on("partner_online", () => {
        state.partner_online = true;
      });

      state.socket.on("partner_offline", () => {
        state.partner_online = false;
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
    getChattingStatus(state) {
      return state.chatting;
    },
    getLoginStatus(state) {
      return state.login;
    },
    getConnectedStatus(state) {
      return state.connected;
    },
    getUserCount(state) {
      return state.user_count;
    },
    getMatchingStatus(state) {
      return state.matching;
    },
    getPartner(state) {
      return state.partner;
    },
    getUsername(state) {
      return state.username;
    },
    getPartnerOnlineStatus(state) {
      return state.partner_online;
    }
  }
});
