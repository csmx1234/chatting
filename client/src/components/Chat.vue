<template lang="pug">
  div#app
    // for testing
    h3(v-if="isTest")
      | dev
      br
      | token: {{need_to_delete_token}}
      br
      | socket: {{need_to_delete_socket}}

    h3(v-if="getFindingStatus")
      | 正在寻找聊天对象

    // message list
    ul(class='message-box' v-chat-scroll="{always: false}")
      li(v-for='msg in getMsgs')
        | {{ msg }}

    // input box
    .input-box
      button(:disabled="getFindingStatus || !getConnectedStatus" v-if="!getChattingStatus" class="btn btn-default" @click='newPartner') getNew
      button(:disabled="!getChattingStatus || !getConnectedStatus" v-if="getChattingStatus" class="btn btn-default" @click='leaveRoom') leave
      input(:disabled="!getChattingStatus || !getConnectedStatus" class="form-control" v-model='message' @keyup.enter='emitMsg' placeholder='please enter message')
      button(:disabled="!getChattingStatus || !getConnectedStatus" class="btn btn-default" @click='emitMsg') send

</template>

<script>
import { mapGetters } from "vuex";
import config from "../config";

export default {
  name: "Chat",
  data: function() {
    return {
      message: "",
      blah: false
    };
  },
  methods: {
    emitMsg: function() {
      this.$store.commit("setMyMsg", this.message);
      this.$store.commit("sendMsg", this.message);
      this.message = "";
    },
    newPartner: function() {
      this.$store.commit("getNewMatch", this.$store.state.RANDOM);
    },
    leaveRoom: function() {
      this.$store.commit("leaveRoom");
    }
  },
  computed: {
    ...mapGetters([
      "getMsgs",
      "getFindingStatus",
      "getChattingStatus",
      "getConnectedStatus"
    ]),
    isTest: function() {
      return config.TEST;
    },
    need_to_delete_token: function() {
      return window.localStorage.getItem("token");
    },
    need_to_delete_socket: function() {
      return this.$store.state.chat_id;
    }
  }
};
</script>

<style lang="scss">
@import "../../node_modules/bootstrap/scss/bootstrap.scss";
.message-box {
  position: absolute;
  width: 100%;
  top: 4rem;
  bottom: 3rem;
  box-sizing: border-box;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  list-style-type: none;
  padding: 0;
}

.input-box {
  @extend .input-group;
  position: absolute;
  bottom: 0;
}
</style>