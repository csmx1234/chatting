<template lang="pug">
  div#register
    h1
      | Login
    div#inputBox
      | Username 
      input(v-model="username" name="username" placeholder="username")
      br
      | Password 
      input(v-model="password" name="password" placeholder="password")
      br
    button(v-on:click="login") Login
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  data: function() {
    return {
      username: "",
      password: ""
    };
  },
  beforeCreate: function() {
    if (this.$store.getters.loggedIn) this.$router.push("/chat");
  },
  methods: {
    async login() {
      try {
        let response = await this.$store.dispatch("login", {
          username: this.username,
          password: this.password
        });
        //        alert(JSON.stringify(response.data));
        window.localStorage.setItem("token", response.data.token);
        this.$store.commit("login");
        this.$router.push("/chat");
      } catch (error) {
        if (error.response) alert(error.response.data.message);
      }
    }
  }
};
</script>

<style></style>
