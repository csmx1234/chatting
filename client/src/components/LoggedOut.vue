<template lang="pug">
  div#app
    h1
      | Goodbye my friend! You are now logged out!
</template>

<script>
// TODO ADD 5 SEC REDIRECT TO HOME
export default {
  name: "LoggedOut",
  beforeCreate() {
    window.localStorage.removeItem("token");
    this.$store.commit("logout");
  }
};
</script>

<style></style>
