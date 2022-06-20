import { loadTimelineAction, createGroupAction, createEventAction, updateEventAction, setCurrentTimelineMutation, appendGroupMutation, appendEventMutation, updateEventMutation, removeEventAction, removeEventMutation, removeGroupAction, updateGroupAction, removeGroupMutation, updateGroupMutation, updateTimelineAction, removeTimelineAction, updateTimelineMutation } from './types.js'
import timelineApi from '@/api/timeline'
import { changeHue } from '../../../utils/index'

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
    async [createGroupAction]({ commit }, groupDetails) {
        let group = Object.assign({
            title:"New group",
            lines:1,
            background: changeHue('#2c8ff4', Math.round(Math.random()*360))
        }, groupDetails)

        let newGroup = await timelineApi.createGroup(this.state.timeline.timeline._id, group)
        commit(appendGroupMutation, { group: newGroup })
    },
    async [createEventAction]({ commit }, { groupNum, eventDetails }) {
        let newEvent = Object.assign({
            title: "New event",
            duration: 5,
            period:0,
            date_repeatable_end:null,
            line:null,
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
        await timelineApi.removeEvent(this.state.timeline.timeline._id, eventId);
        commit(removeEventMutation, { eventId: eventId })
    },
    async [updateEventAction]({ commit }, { eventId, changes }) {
        commit(updateEventMutation, { eventId: eventId, changes: changes })
        // this is wrong but let's try to update faster for faster ui feedback
        await timelineApi.updateEvent(this.state.timeline.timeline._id, eventId, changes);
    },
    async [removeGroupAction]({ commit }, groupId) {
        await timelineApi.removeGroup(this.state.timeline.timeline._id, groupId);
        commit(removeGroupMutation, { groupId: groupId })
    },
    async [updateGroupAction]({ commit }, { groupId, changes }) {
        let updatedGroup = await timelineApi.updateGroup(groupId, changes);
        commit(updateGroupMutation, { groupId: groupId, changes: updatedGroup })
    }
}