import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        loggedin: false
    },
    mutations: {
        login(state) {
            state.loggedin = true
            const socket = io.connect('https://localhost:1234')
        },
        logout(state) {
            state.loggedin = false
        }
    }
})