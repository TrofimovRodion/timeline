import actions from './actions.js'
import mutations from './mutations.js'
import getters from './getters.js'

const state = {
    id: null,
    selectedEventId:null,
    selectedEventRepeatNum:null,
    selectedGroupId:null,
    connected:false,
    title: '',
    timeline: {},
    groups: [],
    connections: []
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}