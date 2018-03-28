import Vue from 'vue'
import Router from 'vue-router'
import Helloworld from '@/components/Helloworld'
import Register from '@/components/Register'
import Login from '@/components/Login'
import LoggedIn from '@/components/LoggedIn'
import LoggedOut from '@/components/LoggedOut'

Vue.use(Router)

export default new Router({
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
      path: '/loggedin',
      name: 'LoggedIn',
      component: LoggedIn
    },
    {
      path: '/logout',
      name: 'LoggedOut',
      component: LoggedOut
    }
  ]
})
