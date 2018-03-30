<template lang="pug">
  div#app
    h1
      | Welcome my friend! You are now logged in! Your token is {{token}} Your chat_id is {{getChatId}}
      br
      | Let's chat now!
    ul
      li(v-for='msg in messages')
        | {{ msg }}
    
    input(v-model='message' v-on:keyup.enter='emitMsg' placeholder='please enter message')

</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  name: "LoggedIn",
  data: function() {
    return {
      chat_id: null,
      message: "",
      messages: []
    };
  },
  created: async function() {
    try {
      const response = await axios({
        method: "get",
        url: `https://${this.$store.getters.getUrl}:1234/api/v1/user`,
        headers: {
          Authorization: window.localStorage.getItem("token")
        }
      });

      this.$store.state.socket.on("chat", data => {
        this.messages.push(data);
      });
    } catch (error) {
      if (error == "Error: Request failed with status code 401") {
        this.$router.push("/login");
      }
    }
  },
  computed: {
    ...mapGetters(["getChatId"]),
    token: function() {
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
