import axios from "axios";

const url = 'http://localhost:3000/'
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

export default {
    async createTimeline(title) {
        let data = (await axios.post(url + 'timeline/create', {
            title: title
        })).data
        return data;
    },
    async updateTimeline(timeline, changes) {
        let data = (await axios.post(url + 'timeline/' + timeline._id + '/update', { changes: changes })).data
        return data;
    },
    async removeTimeline(timeline) {
        await axios.post(url + 'timeline/' + timeline._id + '/remove')
    },
    async loadTimelinesList() {
        let data = (await axios.post(url + 'timeline/list')).data;
        return data;
    },
    async createEvent(timelineId, groupId, eventDetails) {
        let data = (await axios.post(url + 'timeline/' + timelineId + '/events/create', Object.assign(eventDetails, {
            groupId: groupId
        }))).data
        return data;
    },
    async updateEvent(timelineId, eventId, changes) {
        let data = (await axios.post(url + 'timeline/' + timelineId + '/events/' + eventId + '/update', { changes: changes })).data
        return data;
    },
    async removeEvent(timelineId, eventId) {
        await axios.post(url + 'timeline/' + timelineId + '/events/' + eventId + '/remove')
    },
    async createGroup(timelineId, details) {
        let data = (await axios.post(url + 'timeline/' + timelineId + '/groups/create', details)).data
        return data;
    },
    async updateGroup(timelineId, groupId, changes) {
        let data = (await axios.post(url + 'timeline/' + timelineId + '/groups/' + groupId + '/update', { changes: changes })).data
        return data;
    },
    async removeGroup(timelineId, groupId) {
        await axios.post(url + 'timeline/' + timelineId + '/groups/' + groupId + '/remove')
    },
    async connectEvents(timelineId, eventId, eventRepeatNum, targetEventId, targetEventRepeatNum) {
        await axios.post(url+'timeline/'+timelineId + '/events/'+eventId+'/connect', {
            eventRepeatNum:eventRepeatNum,
            targetEventId:targetEventId,
            targetEventRepeatNum:targetEventRepeatNum
        })
    },
    async disconnectEvent(timelineId, eventId) {
        await axios.post(url+'timeline/'+timelineId + '/events/'+eventId+'/disconnect', {})
    },
    async loadData(fileId, startDate, endDate) {
        let data = (await axios.post(url + 'timeline/' + fileId, {
            startDate: startDate,
            endDate: endDate
        })).data;
        return data;
        /*let groups = [];
        let newGroup = {};
        let newEvent = {};
        for (let i=0; i < data.length; i++) {
            newGroup = {
                id: data[i].id,
                title: data[i].title,
                events: [],
                height: 0                
            }
            for (let j=0; j < data[i].events.length; j++) {
                newEvent = {
                    id: data[i].events[j].id,
                    title: data[i].events[j].title,
                    startDate: data[i].events[j].startDate,
                    duration: data[i].events[j].duration,
                    repeat: data[i].events[j].repeat
                }
                newGroup.events.push(newEvent);
            }
            groups.push(newGroup);
        }
        return groups;*/
    }
}