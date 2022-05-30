//import timelineApi from '@/api/timeline'
import Vue from 'vue'
import Vuex from 'vuex'
import guestModule from './modules/guest'
import timelineModule from './modules/timeline'
//import { DateTime } from 'luxon'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fromDate: "2022-01-01",
    toDate: "2022-12-31",
    lineHeight:40,
    cellWidth:25,
    highlightedDays:{
      start:0,end:0
    }
},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    guest: guestModule,
    timeline: timelineModule
  }
})
