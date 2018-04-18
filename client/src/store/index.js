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
    finding: false,
    username: "",

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
    },

    setMyMsg(state, myMsg) {
      state.messages.push("Me:");
      state.messages.push(myMsg);
    },

    sendMsg(state, msg) {
      state.socket.emit("new_message", msg);
    },

    getNewMatch(state, gender) {
      state.finding = true;
      if (gender == config.MALE) {
        state.socket.emit("new_match", config.MALE);
      } else if (gender == config.FEMALE) {
        state.socket.emit("new_match", config.FEMALE);
      } else {
        state.socket.emit("new_match", config.RANDOM);
      }
    },

    leaveRoom(state) {
      state.chatting = false;
      state.socket.emit("leaving_room");
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

      state.socket.on("new_match", () => {
        state.finding = false;
        state.chatting = true;
      });

      state.socket.on("i_left_room", () => {
      });

      state.socket.on("partner_left_room", () => {
        state.chatting = false;
        state.messages.push("Partner has left the room");
        // TODO handle tell self to leave the room
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
    getFindingStatus(state) {
      return state.finding;
    }
  }
});
