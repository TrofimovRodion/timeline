import actions from './actions.js'
import mutations from './mutations.js'
import getters from './getters.js'

const state = {
    id: null,
    title: '',
    timeline: {},
    groups: []
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}