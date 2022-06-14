//import timelineApi from '@/api/timeline'
import Vue from 'vue'
import Vuex from 'vuex'
import guestModule from './modules/guest'
import timelineModule from './modules/timeline'
import { DateTime } from 'luxon'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fromDate: "2022-01-01",
    toDate: "2022-12-31",
    lineHeight: 40,
    scale: 1,
    cellWidth: 25,
    highlightedDays: {
      start:null,end:null
    }
  },
  getters: {},
  mutations: {
    selectEventMutation(state, { event, startcellnum, duration }) {
      if (!event) {
        state.highlightedDays.start = null
        state.highlightedDays.end = null
        return;
      }
      let start = DateTime.fromISO(state.fromDate).plus({days:startcellnum});
      state.highlightedDays.start = start
      state.highlightedDays.end =  start.plus({days:duration})
    },
    updateScaleMutation(state, {scale}) {
        state.scale = scale;
        state.cellWidth = scale==1?25:10;
    }
  },
  actions: {
    selectEventAction({ commit }, { event, startcellnum, duration }) {
      commit("selectEventMutation", { event: event, startcellnum:startcellnum, duration:duration })
    },
    setScale({commit}, {scale}) {
      commit("updateScaleMutation", {scale:scale});
    }
  },
  modules: {
    guest: guestModule,
    timeline: timelineModule
  }
})
