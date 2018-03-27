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
      try {
        const response = await axios({
          method: "post",
          url: "https://45.32.65.216:1234/api/v1/user",
          data: {
            username: this.username,
            password: this.password
          }
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
