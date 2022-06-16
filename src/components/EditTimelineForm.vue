<template>
  <v-card flat>
    <v-card-title> Edit timeline details </v-card-title>

    <v-card-text>
      <v-text-field label="Title" :value="timeline.timeline.title" @input="handleInputTitle"
        placeholder="Untitled timeline" persistent-placeholder></v-text-field>
      
       <TiptapTextArea label="Changelog" :value="timeline.timeline.changelog" @input="handleInputChangelog"/>
    </v-card-text>
  </v-card>
</template>
<script>
import _ from 'lodash'
import { mapState } from 'vuex';
import TiptapTextArea from '../components/TiptapTextArea.vue'

export default {
  components: {
    TiptapTextArea
  },
  data() {
    return {
      editor: null,
    }
  },
  computed: {
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
    handleInputChangelog: _.debounce(function (newChangelog) {
      this.$store.dispatch("timeline/updateTimelineAction", {
        timeline: this.timeline.timeline,
        changes: {
          changelog: newChangelog,
        },
      });
    }, 300),
  },
};
</script>
