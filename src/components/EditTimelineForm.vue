<template>
  <div>
    <h2>Options</h2>
    <v-text-field
      label="Title"
      :value="timeline.timeline.title"
      @input="handleInputTitle"
      placeholder="Untitled timeline"
      persistent-placeholder
    ></v-text-field>
    <v-textarea
      label="Changelog"
      placeholder="No changes yet"
      persistent-placeholder
    >
    </v-textarea>
  </div>
</template>
<script>
import _ from 'lodash'
import { mapState } from 'vuex';

export default {
    computed:{
        ...mapState(['timeline'])
    },
  methods: {
    handleInputTitle: _.debounce(function (newTitle) {
      this.$store.dispatch("timeline/updateTimelineAction", {
        timeline: this.timeline.timeline,
        changes: {
          title: newTitle,
        },
      });
    }, 300),
  },
};
</script>
