<template lang="pug">
  div#app
    h1
      | Goodbye my friend! You are now logged out!
</template>

<script>
export default {
  name: "LoggedOut",
  mounted() {
    window.localStorage.removeItem("token");
    this.$store.commit("logout");
  }
};
</script>

<style></style>
