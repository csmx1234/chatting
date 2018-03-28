import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        loggedin: false,
        dev: true,
        dev_url: 'localhost',
        prod_url: '45.32.65.216',
        socket: null
    },
    mutations: {
        login(state) {
            state.loggedin = true
            state.socket = io.connect(`https://${state.dev?state.dev_url:state.prod_url}:1234`)
        },
        logout(state) {
            state.loggedin = false
        }
    },
    getters: {
        url(state) {
            return state.dev ? state.dev_url : state.prod_url
        }
    }
})
