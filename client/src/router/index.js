import Vue from 'vue'
import Router from 'vue-router'
import Helloworld from '@/components/Helloworld'
import Register from '@/components/Register'

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
      name: 'register',
      component: Register
    }
  ]
})
