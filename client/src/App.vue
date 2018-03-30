<template lang="pug">
  div#app
    router-link(to="/")
      | Home
    |  
    router-link(v-if='getLogin' to="/register")
      | Register
    | 
    router-link(v-if='getLogin' to="/login")
      | Login
    | 
    router-link(v-if='getLogout' to="/chat")
      | Chat
    | 
    router-link(v-if='getLogout' to="/logout")
      | Logout
    br
    br
    img(src="./assets/logo.png")
    router-view
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "App",
  beforeCreate: async function() {
    // if user is still in session, reconnects to chat
    try {
      let response = await this.$store.dispatch("auth", response);
      this.$store.commit("login");
      this.$router.push("/chat");
    } 
    
    // else redirects to homepage
    catch (error) {
      if (error == "Error: Request failed with status code 401") {
        this.$router.push("/");
      }
    }
  },
  computed: mapGetters(["getLogin", "getLogout"])
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#inputBox {
}
</style>
