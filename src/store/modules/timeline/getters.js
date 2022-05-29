export default {
    getGroupById: (state) => (groupId) => {
        for (let i = 0; i < state.groups.length; i++) {
            if (state.groups[i]._id == groupId) return state.groups[i];
        }
        return null
    },
    getEventById: (state) => (eventId) => {
        let group;
        for (let i = 0; i < state.groups.length; i++) {
            group = state.groups[i];
            for (let j = 0; j < group.events.length; j++) {
                if (group.events[j]._id == eventId) return group.events[j];
            }
        }
        return null
    }
}