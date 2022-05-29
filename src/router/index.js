import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView'
import ListView from '../views/ListView.vue'
import TimelineView from '../views/TimelineView'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/list',
    name: 'list',
    component: ListView
  },
  {
    path: '/timeline/:timelineId',
    name: 'timeline',
    component: TimelineView
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
