<template lang="pug">
  div#app
    h1
      | Welcome my friend! You are now logged in!
</template>

<script>
import io from 'socket.io-client'

const socket = io.connect('https://localhost:1234')

export default {
  name: "LoggedIn"
}
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
