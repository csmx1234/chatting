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
