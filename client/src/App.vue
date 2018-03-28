<template lang="pug">
  div#app
    router-link(to="/")
      | Home
    |  
    router-link(v-if='!isLoggedIn' to="/register")
      | Register
    | 
    router-link(v-if='!isLoggedIn' to="/login")
      | Login
    | 
    router-link(v-if='isLoggedIn' to="/logout")
      | Logout
    br
    br
    img(src="./assets/logo.png")
    router-view
</template>

<script>
import store from "./store";

export default {
  name: "App",
  computed: {
    isLoggedIn: function() {
      return store.state.loggedin;
    }
  }
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
