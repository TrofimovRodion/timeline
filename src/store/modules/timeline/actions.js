import { loadTimelineAction, createGroupAction, createEventAction, updateEventAction, updateGroupEventsMutation, setCurrentTimelineMutation, appendGroupMutation, appendEventMutation, updateEventMutation, removeEventAction, removeEventMutation, removeGroupAction, updateGroupAction, removeGroupMutation, updateGroupMutation, updateTimelineAction, removeTimelineAction, updateTimelineMutation } from './types.js'
import timelineApi from '@/api/timeline'
import { changeHue } from '../../../utils/index'

export default {
    async [loadTimelineAction]({ commit }, { timelineId }) {
        let data = await timelineApi.loadData(timelineId);
        commit(setCurrentTimelineMutation, data);
    },
    async joinTimelineSocketAction () {
        if (!this.state.timeline.timeline._id) return;
        this.state.io.emit('subscribeTimeline',this.state.timeline.timeline._id);
    },
    async [updateTimelineAction]({ commit }, { timelineId, changes }) {
        await timelineApi.updateTimeline(timelineId, changes)  
        commit(updateTimelineMutation, {timelineId:timelineId, changes:changes});
    },
    async [removeTimelineAction](e, { timelineId }) {
         timelineApi.removeTimeline(timelineId)  
        alert(111)
        //commit(setCurrentTimelineMutation, data);
    },
    async [createGroupAction](context, groupDetails) {
        let group = Object.assign({
            title:"New group",
            lines:1,
            background: changeHue('#2c8ff4', Math.round(Math.random()*360))
        }, groupDetails)

        await timelineApi.createGroup(this.state.timeline.timeline._id, group)
        //commit(appendGroupMutation, { group: newGroup })
    },
    async [createEventAction]({commit}, { groupNum, eventDetails }) {
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
        //commit(appendEventMutation, { groupId: group._id, eventDetails: newEvent })
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
    async moveEventToGroupAction({ commit }, { eventId, newGroupId }) {
        let event = this.getters['timeline/getEventById'](eventId);
        let oldGroupId = event.groupId;
        event = await timelineApi.updateEvent(this.state.timeline.timeline._id, eventId, {groupId:newGroupId});
        let selectedEventId = this.state.timeline.selectedEventId;
        let selectedEventRepeatNum = this.state.timeline.selectedEventRepeatNum;
        commit(removeEventMutation, { eventId: eventId })
        commit(appendEventMutation, { groupId: newGroupId, eventDetails: event })
        let oldGroup = this.getters['timeline/getGroupById'](oldGroupId);
        commit(updateGroupEventsMutation, { group: oldGroup })
        commit(updateGroupMutation, { groupId:oldGroupId, changes:{} })
        let newGroup = this.getters['timeline/getGroupById'](newGroupId);
        commit(updateGroupEventsMutation, { group: newGroup })    
        commit(updateGroupMutation, { groupId:newGroupId, changes:{} })
        if (selectedEventId == eventId) {
            this.dispatch('selectEventAction', {eventId:eventId, repeatNum: selectedEventRepeatNum})
        }
    },
    async [removeGroupAction]({ commit }, groupId) {
        await timelineApi.removeGroup(this.state.timeline.timeline._id, groupId);
        commit(removeGroupMutation, { groupId: groupId })
    },
    async [updateGroupAction]({ commit }, { groupId, changes }) {
        await timelineApi.updateGroup(this.state.timeline.timeline._id, groupId, changes);
        commit(updateGroupMutation, { groupId: groupId, changes: changes })
    },
    async connectEventsAction({commit}, {eventId, eventRepeatNum, targetEventId, targetEventRepeatNum}) {
        let connectionExists = this.getters['timeline/hasConnection'](eventId, targetEventId);
        if (connectionExists) return false;
        await timelineApi.connectEvents(this.state.timeline.timeline._id, eventId, eventRepeatNum, targetEventId, targetEventRepeatNum)
        commit('connectionRemovedMutation', {eventId:eventId})
        commit('connectionAppendedMutation', { eventId: eventId, eventRepeatNum:eventRepeatNum, targetEventId: targetEventId, targetEventRepeatNum:targetEventRepeatNum })
    },
    async disconnectEventsAction({commit}, {eventId}) {
        await timelineApi.disconnectEvent(this.state.timeline.timeline._id, eventId);
        commit('connectionRemovedMutation', {eventId:eventId})
    }
}