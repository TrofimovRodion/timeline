import { loadTimelinesAction, setTimelinesMutation } from './types.js'
import timelineApi from '@/api/timeline'

export default {
    async [loadTimelinesAction]({ commit }) {
        let data = await timelineApi.loadTimelinesList();
        commit(setTimelinesMutation, data);
    },
}