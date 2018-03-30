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
  beforeCreate: async function() {
    try {
      let response = await this.$store.dispatch("auth");
      await this.$store.dispatch("sendChatId");
      await this.$store.dispatch("connectChat");
    } catch (error) {
      // TODO regular expression match error message
      if (error == "Error: Request failed with status code 401") {
        this.$router.push("/login");
      }
    }
  },
  computed: {
    ...mapGetters(["getChatId", "getMsgs"]),
    need_to_delete_token: function() {
      return window.localStorage.getItem("token");
    }
  },
  methods: {
    emitMsg: function() {
      this.$store.state.socket.emit("chat", this.message);
      this.message = "";
    }
  }
};
</script>

<style></style>
