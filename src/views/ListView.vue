<template>
  <div>
    list
    <div v-for="timeline in guest.timelines" :key="timeline._id">
      <router-link :to="'/timeline/' + timeline._id">{{
        timeline.title
      }}</router-link>
    </div>
    <a @click="handleCreate">Create New</a>
  </div>
</template>

<script>
import { mapState } from "vuex";
import timelineApi from "../api/timeline";

export default {
  name: "ListView",
  mounted() {
    this.$store.dispatch("guest/loadTimelinesAction");
  },
  computed: {
    ...mapState(["guest"]),
  },
  methods: {
    async handleCreate() {
      await timelineApi.createTimeline("Untitled Timeline");
      this.$store.dispatch("guest/loadTimelinesAction");
    },
  },
};
</script>