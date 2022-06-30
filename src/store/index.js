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
    cellWidth: 25,
    highlightedDays: {
      start:null,end:null
    },
    io:null
  },
  getters: {},
  mutations: {
    setSocketIO(state, {io}) {
      state.io = io
    },
    selectEventMutation(state, { eventId, repeatNum }) {
      if (!eventId) {
        state.highlightedDays.start = null
        state.highlightedDays.end = null
        state.timeline.selectedEventId = 0;
        state.timeline.selectedEventRepeatNum = 0;
        return;
      }
      
      state.timeline.selectedEventId = eventId;
      let event = this.getters['timeline/getEventById'](eventId);
      state.timeline.selectedEventRepeatNum = repeatNum;
      let start = DateTime.fromISO(event.date_start)//DateTime.fromISO(state.fromDate).plus({days:startcellnum});
      state.highlightedDays.start = start
      state.highlightedDays.end =  start.plus({days:event.duration})
    },
    selectGroupMutation(state, {group}) {
      if (!group) {
        state.timeline.selectedGroupId = 0;
        return;
      }
      state.timeline.selectedGroupId = group._id;
    },
    updateCellWidthMutation(state, {cellWidth}) {
        state.cellWidth = cellWidth;
    }
  },
  actions: {
    setSocketIO({commit},{io}) {
      commit("setSocketIO", { io: io })
    },
    selectEventAction({ commit }, { eventId, repeatNum }) {
      commit("selectGroupMutation", { group: null })
      commit("selectEventMutation", { eventId: eventId, repeatNum:repeatNum })
    },
    selectGroupAction({ commit }, { group }) {
      commit("selectEventMutation", { eventId: null })
      commit("selectGroupMutation", { group: group })
    },
    setCellWidth({commit}, {cellWidth}) {
      commit("updateCellWidthMutation", {cellWidth:cellWidth});
    },
    SOCKET_event_appended({commit}, newEvent) {
      commit("timeline/appendEventMutation", { groupId: newEvent.groupId, eventDetails: newEvent })
    },
    SOCKET_event_updated({commit}, {eventId, changes}) {
      commit("timeline/updateEventMutation", { eventId: eventId, changes: changes })
    },
    SOCKET_event_removed({commit}, eventId) {
      commit("timeline/removeEventMutation", { eventId: eventId })
    }
  },
  modules: {
    guest: guestModule,
    timeline: timelineModule
  }
})
