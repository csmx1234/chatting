<template lang="pug">
  div#app
    router-link(to="/")
      | Home
    |  
    router-link(v-if='loggedOut' to="/register")
      | Register
    | 
    router-link(v-if='loggedOut' to="/login")
      | Login
    | 
    router-link(v-if='loggedIn' to="/chat")
      | Chat
    | 
    router-link(v-if='loggedIn' to="/logout")
      | Logout
    br
    br
    //- img(src="./assets/logo.png")
    router-view
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "App",
  beforeCreate: async function() {
    if (this.$store.getters.loggedIn) return;

    // setup url
    this.$store.commit("setup");

    // if user is still in session, reconnects to chat
    try {
      await this.$store.dispatch("auth");
      this.$store.commit("login");
      this.$router.push("/chat");
    } catch (error) {
      // else redirects to homepage
      if (error == "Error: Request failed with status code 401") {
        this.$router.push("/");
      }
    }
  },
  destroyed: function() {
    // TODO this doesn't work
    // this.$store.dispatch("goOffline");
  },
  computed: mapGetters(["loggedIn", "loggedOut"])
};
</script>

<style lang="scss">
@import "../node_modules/bootstrap/scss/bootstrap.scss";
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

#inputBox {
}
</style>
