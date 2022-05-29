import { setTimelinesMutation } from './types.js'

export default {
    [setTimelinesMutation](state, timelines) {
        state.timelines = timelines;
    },
}