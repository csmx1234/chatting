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

<style></style>
