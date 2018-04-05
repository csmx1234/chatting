import Vue from 'vue'
import Router from 'vue-router'
import Helloworld from '@/components/Helloworld'
import Register from '@/components/Register'
import Login from '@/components/Login'
import Chat from '@/components/Chat'
import LoggedOut from '@/components/LoggedOut'

Vue.use(Router)

export const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Helloworld',
      component: Helloworld
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat
    },
    {
      path: '/logout',
      name: 'LoggedOut',
      component: LoggedOut
    }
  ]
})
