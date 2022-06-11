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
    zoom: 1,
    cellWidth: 25,
    highlightedDays: {
      start:0,end:0
    }
  },
  getters: {},
  mutations: {
    selectEventMutation(state, { event, startcellnum, duration }) {
      if (!event) {
        state.highlightedDays.start = 0
        state.highlightedDays.end = 0
        return;
      }
      let start = new Date(state.fromDate) - 0 + startcellnum * oneDay
      state.highlightedDays.start = start
      state.highlightedDays.end =  start + duration * oneDay
    },
    updateZoomMutation(state, {zoom}) {
        //console.log(zoom, state.cellWidth);
        state.zoom = zoom;
        switch (zoom) {
          case 7:
            state.cellWidth = 60; break
          case 1:
          default:
            state.cellWidth = 25; break
        }
    }
  },
  actions: {
    selectEventAction({ commit }, { event, startcellnum, duration }) {
      commit("selectEventMutation", { event: event, startcellnum:startcellnum, duration:duration })
    },
    setZoom({commit}, {zoom}) {
      commit("updateZoomMutation", {zoom:zoom});
    }
  },
  modules: {
    guest: guestModule,
    timeline: timelineModule
  }
})
