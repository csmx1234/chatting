<template lang="pug">
  div#app
    h1
      | Welcome my friend! You are now logged in! Your token is {{need_to_delete_token}} Your chat_id is {{getChatId}}
      br
      | Let's chat now!
    ul
      li(v-for='msg in getMsgs')
        | {{ msg }}
    
    input(v-model='message' v-on:keyup.enter='emitMsg' placeholder='please enter message')

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
      return this.$store.getters.getMsgs
    },
    need_to_delete_token: function() {
      return window.localStorage.getItem("token");
    },
  },
  methods: {
    emitMsg: function() {
      this.$store.state.socket.emit("newMsg", this.message);
      this.message = "";
    }
  }
};
</script>

<style></style>
