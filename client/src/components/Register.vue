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
  methods: {
    async register() {
      await axios({
        method: "post",
        url: "http://127.0.0.1:1234/api/v1/user",
        data: {
          username: this.username,
          password: this.password
        }
      })
        .catch(function(error) {
          if (error.response) alert(error.response.data.message);
        })
        .then(function(response) {
          console.log(`response: ${response}`);
        });
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
</style>
