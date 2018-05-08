<template lang="pug">
  div#app(class="app-header")
    // header
    .router-links
      .user-count(v-if='getLoginStatus')
        | Users: {{ getUserCount }}
      router-link(to="/")
        | Home
      |  
      router-link(v-if='!getLoginStatus' to="/register")
        | Register
      | 
      router-link(v-if='!getLoginStatus' to="/login")
        | Login
      | 
      router-link(v-if='getLoginStatus' to="/chat")
        | Chat
      | 
      router-link(v-if='getLoginStatus' @click.native="reset" to="/logout")
        | Logout

      button(v-if='getLoginStatus' @click="toggleMenu" type="button" id="sidebarCollapse" class="menu-btn")
          i(class="glyphicon glyphicon-align-left")
          | Menu
      button(v-if='getLoginStatus' @click="toggleFriendList" type="button" id="sidebarCollapse" class="friend-btn")
          i(class="glyphicon glyphicon-align-right")
          | Friends

      //- canvas(v-if='getLoginStatus' id='my_canvas' width='22' height='22')
      //- br
      //- br

    // logo
    //- img(src="./assets/logo.png")

    // sidebars
    nav(class="sidebar menu-sidebar" v-bind:class="{ active: menuActive }")
      div(class="sidebar-header")
        h3
          | Menu
    nav(class="sidebar friend-list-sidebar" v-bind:class="{ active: friendListActive }")
      div(class="sidebar-header")
        h3
          | Friends

    // rest of the app
    router-view
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "App",
  data: function() {
    return {
      menuActive: false,
      friendListActive: false
    };
  },
  beforeCreate: async function() {
    if (this.$store.getters.loggedIn) return;

    // setup url
    this.$store.commit("setup");

    // if user is still in session, reconnects to chat
    try {
      await this.$store.dispatch("auth");
      this.$router.push("/chat");
    } catch (error) {
      // else redirects to homepage
      if (error == "Error: Request failed with status code 401") {
        this.$router.push("/");
      }
    }
  },
  mounted: function() {

    // ctx.stroke();
  },
  methods: {
    toggleMenu: function() {
      this.friendListActive = false;
      this.menuActive = !this.menuActive;
    },
    toggleFriendList: function() {
      this.menuActive = false;
      this.friendListActive = !this.friendListActive;
    },
    reset: function() {
      this.menuActive = false;
      this.friendListActive = false;
    }
  },
  destroyed: function() {
    // TODO this doesn't work
    // this.$store.dispatch("goOffline");
  },
  computed: mapGetters(["getLoginStatus", "getChattingStatus", "getUserCount"])
};
</script>

<style lang="scss">
@import "../node_modules/bootstrap/scss/bootstrap.scss";
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  z-index: 0;
}

.app-header {
  margin-top: 20px;
}

.user-count {
  position: absolute;
  top: 0px;
  right: 10px;
}

.friend-btn {
  @extend .btn;
  position: absolute;
  right: 10px;
  padding: 0;
}

.menu-btn {
  @extend .btn;
  position: absolute;
  left: 10px;
  padding: 0;
}

.sidebar {
  position: absolute;
  text-align: left;
  width: 250px;
  top: 4rem;
  bottom: 4rem;
  z-index: 1;
}

.menu-sidebar {
  background-color: cadetblue;
  left: -250px;
}

.friend-list-sidebar {
  background-color: beige;
  left: -250px;
}

.menu-sidebar.active {
  left: 0;
}

.friend-list-sidebar.active {
  left: auto;
  right: 0;
}

.userpass-box {
  @extend .form-group;
  padding-left: 2rem;
  padding-right: 2rem;
  text-align: left;
  margin: 0;
}

.userpass-input {
  @extend .form-control;
  margin-bottom: 1rem;
}
</style>
