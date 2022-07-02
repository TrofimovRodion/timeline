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
    },
    SOCKET_group_appended({commit}, newGroup) {
      commit("timeline/appendGroupMutation", { group:newGroup })
    },
    SOCKET_group_updated({commit}, {groupId, changes}) {
      commit("timeline/updateGroupMutation", { groupId:groupId, changes:changes })
    },
    SOCKET_group_removed({commit}, groupId) {
      commit("timeline/removeGroupMutation", {groupId:groupId})
    },
    SOCKET_timeline_updated({commit}, {timelineId, changes}) {
      commit("timeline/updateTimelineMutation", {timelineId:timelineId, changes:changes})
    },
    SOCKET_connection_appended({commit}, params) {
      commit("timeline/connectionAppendedMutation", params)
    },
    SOCKET_connection_removed({commit}, {eventId}) {
      commit("timeline/connectionRemovedMutation", {eventId:eventId})
    },
    /*SOCKET_timeline_removed({commit}, timelineId) {
      commit("timeline/updateTimelineMutation", {timelineId:timelineId, changes:changes})
    },*/
  },
  modules: {
    guest: guestModule,
    timeline: timelineModule
  }
})
