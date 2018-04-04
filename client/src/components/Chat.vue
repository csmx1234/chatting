<template lang="pug">
  div#app
    //- .message-box
    h1
      | Welcome my friend! You are now logged in! Your token is {{need_to_delete_token}} Your chat_id is {{getChatId}}
      br
      | Let's chat now!
    ul(class='message-box' v-chat-scroll="{always: false}")
      li(v-for='msg in getMsgs')
        | {{ msg }}

    .input-box
      button(class="btn btn-default" @click='newPartner') getNew
      input(class="form-control" v-model='message' @keyup.enter='emitMsg' placeholder='please enter message')
      button(class="btn btn-default" @click='emitMsg') send

</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Chat",
  data: function() {
    return {
      message: ""
    };
  },
  computed: {
    ...mapGetters(["getChatId"]),
    getMsgs: function() {
      return this.$store.getters.getMsgs;
    },
    need_to_delete_token: function() {
      return window.localStorage.getItem("token");
    }
  },
  methods: {
    emitMsg: function() {
      this.$store.commit("setMyMsg", this.message);
      this.$store.commit("sendMsg", this.message);
      this.message = "";
    },
    newPartner: function() {
      alert("we getting new partner ayyyyy!");
    }
  }
};
</script>

<style lang="scss">
@import '../../node_modules/bootstrap/scss/bootstrap.scss';
.message-box {
  position: absolute;
  width: 100%;
  top: 8rem;
  bottom: 3rem;
  box-sizing: border-box;
  overflow-y: scroll;
  list-style-type: none;
}

.input-box {
  @extend .input-group;
  position: absolute;
  bottom: 0;
}
</style>