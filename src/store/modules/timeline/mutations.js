//import { DateTime } from 'luxon'
import { setCurrentTimelineMutation,updateTimelineMutation, setGroupsMutation, appendGroupMutation, appendEventMutation, updateEventMutation, removeEventMutation, updateGroupEventsMutation, removeGroupMutation, updateGroupMutation } from './types.js'
import { getContrastColor } from '../../../utils/index'

export default {
    [setCurrentTimelineMutation](state, timelineDetails) {
        state.timeline = timelineDetails;
        this.commit('timeline/setGroupsMutation', timelineDetails.groups);
        this.commit('timeline/setConnectionsMutation', timelineDetails.connections);
    },
    [updateTimelineMutation](state, { timelineId, changes }) {
        if (state.timeline._id!=timelineId) return;
        for (let i in changes) {
            state.timeline[i] = changes[i]
        }
    },
    [setGroupsMutation](state, groups) {
        state.groups = [];
        for (let g in groups) {
            this.commit('timeline/appendGroupMutation', { group: groups[g] })
        }
    },
    setConnectionsMutation(state, connections) {
        state.connections = [];
        for (let c in connections) {
            this.commit('timeline/connectionAppendedMutation', connections[c])
        }
    },
    [appendGroupMutation](state, { group, skipUpdate }) {
        let top = (state.groups.length == 0) ? 0 : (state.groups[state.groups.length - 1].top + state.groups[state.groups.length - 1].lines);
        let backgroundColor = (group.background)?group.background:"#2c8ff4";
        let groupExists = this.getters['timeline/getGroupById'](group._id)
        if (groupExists) return;
        state.groups.push({
            _id: group._id,
            title: group.title,
            lines: group.lines,
            top: top,
            timeline: state.timeline,
            background: backgroundColor,
            foreground: getContrastColor(backgroundColor),
            events: []
        })
        for (let e in group.events) {
            this.commit('timeline/appendEventMutation', {
                groupId: group._id,
                eventDetails: group.events[e],
                skipUpdate: skipUpdate ? true : false
            });
        }
    },
    [updateGroupEventsMutation](state, group) {
        /*let days = {};
        let sortedEvents = [...group.events].sort((a, b) => {
            return DateTime.fromISO(a.date_start) > DateTime.fromISO(b.date_start) ? 1 : ((DateTime.fromISO(a.date_start) < DateTime.fromISO(b.date_start)) ? -1 : 0)
        })
        for (let e in sortedEvents) {
            let event = sortedEvents[e]
            event.line = -1
            let startcellnum = DateTime.fromISO(event.date_start).diff(DateTime.fromISO('2000-01-01'), 'days').as('days')
            for (let d = startcellnum - 1; d <= startcellnum + event.duration; d++) {
                if (!days[d]) days[d] = {};
                if (event.line == -1 || (days[d][event.line])) {
                    for (let l = 0; l < 500; l++) {
                        if (!days[d][l]) {
                            event.line = l;
                            days[d][l] = event;
                            break;
                        }
                    }
                } else {
                    days[d][event.line] = event;
                }
            }
        }*/
        for (let e in group.events) {
            if (!group.events[e].line) {
                group.events[e].line = 0
            }
        }
        let top = 0;
        for (let g = 0; g < state.groups.length; g++) {
            let gr = state.groups[g]
            let grLines = 1;
            gr.top = top;
            for (let e in gr.events) {
                let event = gr.events[e]
                grLines = Math.max(grLines, event.line + 1)
            }
            if (gr.lines < grLines) gr.lines = grLines
            top += gr.lines;
        }
    },
    [appendEventMutation](state, { groupId, eventDetails, skipUpdate }) {
        let newEvent = Object.assign({}, eventDetails);
        const group = this.getters['timeline/getGroupById'](groupId)
        group.events.push(newEvent)
        if (!skipUpdate) {
            this.commit('timeline/updateGroupEventsMutation', group)
        }
    },
    [removeEventMutation](state, { eventId }) {
        if (eventId == state.selectedEventId) {
            state.selectedEventId = null
            state.selectedEventRepeatNum = null
        }
        const event = this.getters['timeline/getEventById'](eventId);
        if (!event) return;
        const group = this.getters['timeline/getGroupById'](event.groupId);
        group.events = group.events.filter(ev => (ev._id != eventId));
        this.commit('timeline/updateGroupEventsMutation', group)
    },
    [updateEventMutation](state, { eventId, changes }) {
        const event = this.getters['timeline/getEventById'](eventId);
        for (let i in changes) {
            event[i] = changes[i]
        }
    },
    
    [removeGroupMutation](state, { groupId }) {
        if (groupId == state.selectedGroupId) {
            state.selectedGroupId = null
        }
        state.groups = state.groups.filter(gr => (gr._id != groupId));
    },
    [updateGroupMutation](state, { groupId, changes }) {
        let group = this.getters['timeline/getGroupById'](groupId);
        for (let i in changes) {
            group[i] = changes[i]
        }
        group.foreground = getContrastColor(group.background);
        let maxLines = 1;
        group.events.forEach(event => {
            maxLines = Math.max(maxLines,event.line+1)
        });
        group.lines = maxLines
    },
    connectionAppendedMutation(state, {eventId, eventRepeatNum, targetEventId,targetEventRepeatNum}) {
        state.connections.push({
            eventId:eventId,
            eventRepeatNum:eventRepeatNum,
            targetEventId:targetEventId,
            targetEventRepeatNum:targetEventRepeatNum
        })
    },
    connectionRemovedMutation(state, {eventId}) {
        state.connections = state.connections.filter(el=>{
            return !(el.eventId==eventId)
        })
    }
}