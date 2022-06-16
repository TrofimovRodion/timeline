<style scoped>
@import "../assets/css.css";

#timelineActions {
  position: absolute;
  width:150px;
  bottom:20px;
  left:20px;
}
</style>

<template>
  <div style="height:100%">
    <NavigationBar></NavigationBar>
    <v-main style="height:100%">
      <div class="panels" ref="panels">
        <div class="panel mainPanel" ref="mainPanel">
          <EditGroupDialog
            :editGroupId="editGroupId"
            :display="editGroupDialog.display"
            @close="saveGroupDialog"
          />


          <div id="timeline" class="timeline" ref="timeline">
            <div class="timelineWrap">
              <TimelineDays></TimelineDays>
              <TimelineEvents></TimelineEvents>
            </div>
          </div>
          <div id="timelineActions">
            <v-slider min="10" max="25" v-model="localCellWidth">
            <template v-slot:prepend>
              <v-icon
                @click="setCellWidth(cellWidth-1)"
              >
                mdi-minus
              </v-icon>
            </template>

            <template v-slot:append>
              <v-icon
                @click="setCellWidth(cellWidth+1)"
              >
                mdi-plus
              </v-icon>
            </template>
            </v-slider>
          </div>
        </div>
          <div class="panel rightPanel elevation-5" :style="`min-width:`+panelWidth+`px`" ref="rightPanel">
            <div class="panelSplitter"
              @dragstart="handleSplitterDragStart"
              @drag="handleSplitterDrag"
              @dragend="handleSplitterDragEnd"
              draggable="true"
              ></div>
            <EditTimelineFrom v-if="!timeline.selectedEventId"></EditTimelineFrom>
            <EditEventForm v-if="timeline.selectedEventId" :editEventId="timeline.selectedEventId"
></EditEventForm>
          </div>
        </div>
    </v-main>
  </div>

</template>

<script>
import { mapState } from "vuex";
import EditGroupDialog from "../components/EditGroupDialog.vue";
import NavigationBar from "../components/NavigationBar.vue";
import TimelineDays from "../components/TimelineDays.vue";
import TimelineEvents from "../components/TimelineEvents.vue";
import EditEventForm from "../components/EditEventForm.vue";
import EditTimelineFrom from "../components/EditTimelineForm.vue";

//import _ from 'lodash'

var dragImage = document.createElement('img');
dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export default {
  name: "TimelineView",

  components: {
    EditGroupDialog,
    NavigationBar,
    TimelineDays,
    TimelineEvents,
    EditEventForm,
    EditTimelineFrom,
},
  mounted() {
    this.panelWidth = localStorage.getItem('rightPanelWidth');
    if (!this.panelWidth) 
      this.panelWidth = 300;
    this.$store.dispatch("timeline/loadTimelineAction", {
      timelineId: this.$route.params.timelineId,
    });
    this.localCellWidth = this.cellWidth;
  },

  data() {
    return {
      message: "Hello Vue!",
      scroll: {
        x: 150,
        y: 0,
        deltaX: 0,
        deltaY: 0,
      },
      leftBlockWidth: 150,
      handlerX: 0,
      handlerY: 0,
      handlerDisplay: "none",
      highlightedDayNum: -1,
      editDialog: {
        display: false,
        startDatePicker: false,
      },
      editGroupDialog: {
        display: false,
      },
      editEventId: null,
      editGroupId: null,
      dragStartX:0,
      panelWidthDragStart:0,
      panelWidth:300,
      localCellWidth:25
    };
  },
  computed: {
    display: function () {
      let groups = [];
      let top = 0;
      for (let i = 0; i < this.timeline.groups.length; i++) {
        groups.push(Object.assign({}, this.timeline.groups[i]));
        groups[i].top = top;
        let renderedEvents = [];
        for (let j = 0; j < groups[i].events.length; j++) {
          let event = groups[i].events[j];
          event.key = event._id;
          event.startcellnum = Math.ceil(
            Math.abs(new Date(event.date_start) - new Date(this.fromDate)) /
              (1000 * 60 * 60 * 24)
          );
          renderedEvents.push(Object.assign({}, event));

        }
        groups[i].events = renderedEvents;
        top += groups[i].height;
      }

      return {
        groups: groups,
      };
    },
    scrollTransform: function () {
      return "translate(" + this.scroll.x + ",0)";
    },
    ...mapState(["timeline", "fromDate", "toDate", "cellWidth"]),
  },
  watch:{
    cellWidth(newVal) {
      this.localCellWidth=newVal;
    },
    localCellWidth(newVal) {
      this.setCellWidth(newVal)
    }
  },
  methods: {
    handleMouseDown(event) {
      let dayNum = Math.round((event.offsetX - this.scroll.x - 15) / 25);
      let groupNum = -1;
      let line = Math.round((event.offsetY - 15) / 25);
      let h = 0;
      for (let i = 0; i < this.timeline.groups.length; i++) {
        h += this.timeline.groups[i].height;
        if (line < h) {
          groupNum = i;
          break;
        }
      }
      let startDate = new Date(this.fromDate);
      startDate.setDate(startDate.getDate() + dayNum);
      this.createEvent(groupNum, {
        date_start: startDate.toISOString().slice(0, 10),
      });
    },
    handleClickEvent(groupNum, eventNum) {
      this.editDialog.display = true;
      this.editEventId = this.timeline.groups[groupNum].events[eventNum]._id;
    },
    handleClickGroup(groupId) {
      this.editGroupDialog.display = true;
      this.editGroupId = groupId;
    },
    createGroup(params) {
      this.$store.dispatch("timeline/createGroupAction", params);
    },
    createEvent(groupNum, params) {
      this.$store.dispatch("timeline/createEventAction", {
        groupNum: groupNum,
        eventDetails: params,
      });
    },
    saveEventDialog() {
      this.editDialog.display = false;
    },
    saveGroupDialog() {
      this.editGroupDialog.display = false;
    },
    handleSplitterDragStart(e) {
      this.dragStartX = e.clientX;
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      this.panelWidthDragStart = this.panelWidth;
    },
    handleSplitterDrag(e) {
      if (!e.clientX) return;
      this.panelWidth = Math.max(300,this.panelWidthDragStart - e.clientX + this.dragStartX);
    },
    handleSplitterDragEnd() {
      localStorage.setItem('rightPanelWidth', this.panelWidth);
    },
    setCellWidth(cellWidth) {
      this.$store.dispatch("setCellWidth", {
        cellWidth: cellWidth,
      });
    }

  },
};
</script>