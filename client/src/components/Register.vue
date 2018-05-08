<template lang="pug">
  div#register(class="app-body")
    h1
      | Register
    .userpass-box
      | Username
      input(class="userpass-input" v-model="username" placeholder="Username")
      | Password
      input(class="userpass-input" v-model="password" placeholder="Password")
      | Gender
      select(class="userpass-input" v-model="gender")
        option(v-for="option in options" v-bind:value="option.value")
          | {{ option.text }}
    button(class="btn" v-if='not_clicked' v-on:click="register") Register
</template>

<script>
import axios from "axios";
import config from "../config";

export default {
  name: "Register",
  data: function() {
    return {
      username: "",
      password: "",
      gender: config.MALE,
      options: [
        { text: "男", value: config.MALE },
        { text: "女", value: config.FEMALE },
      ],
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
          password: this.password,
          gender: this.gender
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
