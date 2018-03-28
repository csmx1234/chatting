<template lang="pug">
  div#app
    h1
      | Welcome my friend! You are now logged in!
      br
      | Let's chat now!
    ul
      li(v-for='msg in messages')
        | {{ msg }}
    
    input(v-model='message' v-on:keyup.enter='emitMsg' placeholder='please enter message')

</template>

<script>
import store from '../store'

export default {
  name: "LoggedIn",
  data: function() {
    return {
      message: '',
      messages: []
    }
  },
  created: function() {
    store.state.socket.on('chat', (data) => {
      this.messages.push(data)
    });
  },
  methods: {
    emitMsg: function() {
      store.state.socket.emit('chat', this.message)
    }
  }
}
</script>

<style></style>
