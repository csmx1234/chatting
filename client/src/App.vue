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
import axios from 'axios';

export default {
  name: "App",
  created: async function() {
    if ( window.localStorage.getItem('token') != undefined ) {
      try {
      const response = await axios({
        method: "get",
        url: `https://${this.$store.getters.getUrl}:1234/api/v1/user`,
        headers: {
          Authorization: window.localStorage.getItem("token")
        }
      });

      this.$store.commit('login');
    } catch (error) {
      if (error == "Error: Request failed with status code 401") {
        this.$router.push("/login");
      }
    }
    }
  },
  computed: mapGetters(['getLogin','getLogout'])
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
