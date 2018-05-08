<template lang="pug">
  div#app(class="app-body")
    h1
      | Goodbye my friend! You are now logged out!
</template>

<script>
// TODO ADD 5 SEC REDIRECT TO HOME
export default {
  name: "LoggedOut",
  beforeCreate: async function () {
    if (this.$store.getters.loggedOut) {
      this.$router.push("/");
      return;
    }
    await this.$store.commit("logout");
  }
};
</script>

<style></style>
