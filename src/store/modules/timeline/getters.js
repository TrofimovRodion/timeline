export default {
    getAllGroups: (state) => () => {
        return state.groups;
    },
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
    },
    hasConnection:(state)=>(eventId,targetEventId) => {
        let connection;
        for(let i=0;i<state.connections.length;i++) {
            connection = state.connections[i];
            if (connection.eventId == eventId && connection.targetEventId == targetEventId) return true;
            if (connection.eventId == targetEventId && connection.targetEventId == eventId) return true;
        }
        return false;
    }
}