<template lang="pug">
  div#register
    h1
      | Register
    .userpass-box
      | Username
      input(class="userpass-input" v-model="username" placeholder="Username")
      | Password
      input(class="userpass-input" v-model="password" placeholder="Password")
    button(class="btn" v-if='not_clicked' v-on:click="register") Register
</template>

<script>
import axios from "axios";

export default {
  name: "Register",
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
    async register() {
      this.not_clicked = false;
      try {
        await this.$store.dispatch("register", {
          username: this.username,
          password: this.password
        });
        this.$router.push("/login");
      } catch (error) {
        if (error.response) alert(error.response.data.message);
        this.not_clicked = true;
      }
    }
  }
};
</script>

<style></style>
