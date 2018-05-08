<template lang="pug">
  div#register(class="app-body")
    h1
      | Login
    .userpass-box
      | Username
      input(class="userpass-input" v-model="username" placeholder="Username")
      | Password
      input(class="userpass-input" v-model="password" placeholder="Password")
    button(class="btn" v-if='not_clicked' v-on:click="login") Login
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  data: function() {
    return {
      username: "",
      password: "",
      not_clicked: true
    };
  },
  beforeCreate: function() {
    if (this.$store.getters.loggedIn) this.$router.push("/chat");
  },
  methods: {
    async login() {
      this.not_clicked = false;
      try {
        await this.$store.dispatch("login", {
          username: this.username,
          password: this.password
        });
        //        alert(JSON.stringify(response.data));
        this.$router.push("/chat");
      } catch (error) {
        if (error.response) {
          alert(error.response.data.message);
          this.not_clicked = true;
        }
      }
    }
  }
};
</script>

<style></style>
