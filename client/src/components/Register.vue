<template lang="pug">
  div#register
    h1
      | Register
    | Username 
    input(v-model="username" name="username" placeholder="username")
    br
    | Password 
    input(v-model="password" name="password" placeholder="password")
    br
    button(v-on:click="register") Register
</template>

<script>
import axios from "axios";

export default {
  name: "Register",
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
    async register() {
      try {
        let response = await this.$store.dispatch("register", {
          username: this.username,
          password: this.password
        });
        alert(response.data.message);
        this.$router.push("/login");
      } catch (error) {
        if (error.response) alert(error.response.data.message);
      }
    }
  }
};
</script>

<style></style>
