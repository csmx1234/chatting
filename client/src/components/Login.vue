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
import axios from 'axios'
import store from '../store'

export default {
  name: "Login",
  data: function() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios({
          method: "post",
          url: `https://${store.getters.url}:1234/api/v1/login`,
          data: {
            username: this.username,
            password: this.password
          }
        });
        alert(JSON.stringify(response.data))
        this.$router.push("/loggedin")
        store.commit('login')
      } catch (error) {
        if (error.response) alert(error.response.data.message)
      }
    }
  }
};
</script>

<style></style>
