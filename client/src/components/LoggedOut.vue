<template lang="pug">
  div#app
    h1
      | Goodbye my friend! You are now logged out!
</template>

<script>
import store from '../store'

export default {
  name: 'LoggedOut',
  mounted() {
    store.commit('logout')
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
