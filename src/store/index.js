//import timelineApi from '@/api/timeline'
import Vue from 'vue'
import Vuex from 'vuex'
import guestModule from './modules/guest'
import timelineModule from './modules/timeline'
//import { DateTime } from 'luxon'

Vue.use(Vuex)
const oneDay = 24 * 60 * 60 * 1000;

export default new Vuex.Store({
  state: {
    fromDate: "2022-01-01",
    toDate: "2022-12-31",
    lineHeight: 40,
    cellWidth: 25,
    highlightedDays: {
      start:0,end:0
    }
  },
  getters: {},
  mutations: {
    selectEventMutation(state, { event, startdaynum, duration }) {
      if (!event) {
        state.highlightedDays.start = 0
        state.highlightedDays.end = 0
        return;
      }
      let start = new Date(state.fromDate) - 0 + startdaynum * oneDay
      state.highlightedDays.start = start
      state.highlightedDays.end =  start + duration * oneDay
    }
  },
  actions: {
    selectEventAction({ commit }, { event, startdaynum, duration }) {
      commit("selectEventMutation", { event: event, startdaynum:startdaynum, duration:duration })
    }
  },
  modules: {
    guest: guestModule,
    timeline: timelineModule
  }
})
