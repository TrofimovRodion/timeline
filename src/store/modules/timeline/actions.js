import { loadTimelineAction, createGroupAction, createEventAction, updateEventAction, setCurrentTimelineMutation, appendGroupMutation, appendEventMutation, updateEventMutation, removeEventAction, removeEventMutation, removeGroupAction, updateGroupAction, removeGroupMutation, updateGroupMutation, updateTimelineAction, removeTimelineAction, updateTimelineMutation } from './types.js'
import timelineApi from '@/api/timeline'

export default {
    async [loadTimelineAction]({ commit }, { timelineId }) {
        let data = await timelineApi.loadData(timelineId);
        commit(setCurrentTimelineMutation, data);
    },
    async [updateTimelineAction]({ commit }, { timeline, changes }) {
        let updatedTimeline = await timelineApi.updateTimeline(timeline, changes)  
        commit(updateTimelineMutation, {timeline:timeline, changes:updatedTimeline});
    },
    async [removeTimelineAction](e, { timelineId }) {
         timelineApi.removeTimeline(timelineId)  
        alert(111)
        //commit(setCurrentTimelineMutation, data);
    },
    async [createGroupAction]({ commit }, group) {
        setTimeout(() => {
            commit(appendGroupMutation, group)
        }, 200)
    },
    async [createEventAction]({ commit }, { groupNum, eventDetails }) {
        let newEvent = Object.assign({
            title: "New event",
            duration: 5,
            period:0,
            date_repeatable_end:null,
            color:0
        }, eventDetails);
        if (groupNum == -1) {
            let newGroup = await timelineApi.createGroup(this.state.timeline.timeline._id, {
                title: newEvent.title,
                lines:1,
                background: '#2c8ff4'
            })
            commit(appendGroupMutation, { group: newGroup })
            groupNum = this.state.timeline.groups.length - 1;
        }
        let group = this.state.timeline.groups[groupNum];
        newEvent = await timelineApi.createEvent(this.state.timeline.timeline._id, group._id, newEvent)
        commit(appendEventMutation, { groupNum: groupNum, eventDetails: newEvent })
    },
    async [removeEventAction]({ commit }, eventId) {
        await timelineApi.removeEvent(eventId);
        commit(removeEventMutation, { eventId: eventId })
    },
    async [updateEventAction]({ commit }, { eventId, changes }) {
        commit(updateEventMutation, { eventId: eventId, changes: changes })
        // this is wrong but let's try to update faster for faster ui feedback
        await timelineApi.updateEvent(this.state.timeline.timeline._id, eventId, changes);
    },
    async [removeGroupAction]({ commit }, group) {
        await timelineApi.removeGroup(group);
        commit(removeGroupMutation, { group: group })
    },
    async [updateGroupAction]({ commit }, { group, changes }) {
        let updatedGroup = await timelineApi.updateGroup(group, changes);
        commit(updateGroupMutation, { group: group, changes: updatedGroup })
    }
}