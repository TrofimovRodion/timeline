import { DateTime } from 'luxon'
import { setCurrentTimelineMutation,updateTimelineMutation, setGroupsMutation, appendGroupMutation, appendEventMutation, updateEventMutation, removeEventMutation, updateGroupEventsMutation, removeGroupMutation, updateGroupMutation } from './types.js'
import { getContrastColor } from '../../../utils/index'

export default {
    [setCurrentTimelineMutation](state, timelineDetails) {
        state.timeline = timelineDetails;
        this.commit('timeline/setGroupsMutation', timelineDetails.groups);
    },
    [updateTimelineMutation](state, { timeline, changes }) {
        //state.timeline.timeline = changes;
        for (let i in changes) {
            timeline[i] = changes[i]
        }
    },
    [setGroupsMutation](state, groups) {
        state.groups = [];
        for (let g in groups) {
            this.commit('timeline/appendGroupMutation', { group: groups[g] })
        }
    },
    [appendGroupMutation](state, { group, skipUpdate }) {
        let top = (state.groups.length == 0) ? 0 : (state.groups[state.groups.length - 1].top + state.groups[state.groups.length - 1].height);
        let backgroundColor = (group.background)?group.background:"#2c8ff4";

        state.groups.push({
            _id: group._id,
            title: group.title,
            height: 1,
            top: top,
            timeline: state.timeline,
            background: backgroundColor,
            foreground: getContrastColor(backgroundColor),
            events: []
        })
        for (let e in group.events) {
            this.commit('timeline/appendEventMutation', {
                groupNum: state.groups.length - 1,
                eventDetails: group.events[e],
                skipUpdate: skipUpdate ? true : false
            });
        }
    },
    [updateGroupEventsMutation](state, group) {
        let days = {};
        let sortedEvents = [...group.events].sort((a, b) => {
            return DateTime.fromISO(a.date_start) > DateTime.fromISO(b.date_start) ? 1 : ((DateTime.fromISO(a.date_start) < DateTime.fromISO(b.date_start)) ? -1 : 0)
        })
        for (let e in sortedEvents) {
            let event = sortedEvents[e]
            event.line = -1
            let startdaynum = DateTime.fromISO(event.date_start).diff(DateTime.fromISO('2000-01-01'), 'days').as('days')
            for (let d = startdaynum - 1; d <= startdaynum + event.duration; d++) {
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
        }
        let top = 0;
        for (let g = 0; g < state.groups.length; g++) {
            let gr = state.groups[g]
            gr.height = 1;
            gr.top = top;
            for (let e in gr.events) {
                let event = gr.events[e]
                gr.height = Math.max(gr.height, event.line + 1)
            }
            top += gr.height;
        }
    },
    [appendEventMutation](state, { groupNum, eventDetails, skipUpdate }) {
        let newEvent = Object.assign({}, eventDetails);
        const group = state.groups[groupNum];
        //newEvent.group = state.groups[groupNum]
        //newEvent.timeline = state.groups[groupNum].timeline
        state.groups[groupNum].events.push(newEvent)
        if (!skipUpdate) {
            this.commit('timeline/updateGroupEventsMutation', group)
        }
    },
    [removeEventMutation](state, { event }) {
        const group = this.getters['timeline/getGroupById'](event.groupId);
        group.events = group.events.filter(ev => (ev._id != event._id));
        this.commit('timeline/updateGroupEventsMutation', group)
    },
    [updateEventMutation](state, { eventId, changes }) {
        const event = this.getters['timeline/getEventById'](eventId);
        for (let i in changes) {
            event[i] = changes[i]
        }
    },
    
    [removeGroupMutation](state, { group }) {
        //const timeline = group.timeline;
        state.groups = state.groups.filter(gr => (gr._id != group._id));
        this.commit('timeline/updateGroupEventsMutation', group)
    },
    [updateGroupMutation](state, { group, changes }) {
        for (let i in changes) {
            group[i] = changes[i]
        }
        group.foreground = getContrastColor(group.background);
    }
}