<style scoped>
@import "../assets/css.css";

#timelineActions {
  position: absolute;
  width: 150px;
  bottom: 20px;
  left: 20px;
}

.timelineEvents {
  position: absolute;
  top: 50px;
}

.timelineGroups {
  position: sticky;
  left: 0px;
}

.timelineCalendar {
  position: sticky;
  top: 0px;
}
</style>

<template>
  <div style="height:100%">
    <NavigationBar></NavigationBar>
    <v-main style="height:100%">
      <div class="panels" ref="panels">
        <div class="panel mainPanel">
          <div id="timeline" class="timeline" ref="timeline" @scroll="handleScroll($event.currentTarget)">
            <TimelineEvents class='timelineEvents' :style="{ width: display.width, height: display.height }">
            </TimelineEvents>
            <TimelineGroups class='timelineGroups'></TimelineGroups>
            <TimelineDays class="timelineCalendar"></TimelineDays>
          </div>
          <div id="timelineActions">
            <v-slider min="10" max="25" v-model="localCellWidth">
              <template v-slot:prepend>
                <v-icon @click="setCellWidth(cellWidth - 1)">
                  mdi-minus
                </v-icon>
              </template>

              <template v-slot:append>
                <v-icon @click="setCellWidth(cellWidth + 1)">
                  mdi-plus
                </v-icon>
              </template>
            </v-slider>
          </div>
        </div>
        <div class="panel rightPanel elevation-5" :style="`min-width:` + panelWidth + `px`" ref="rightPanel">
          <div class="panelSplitter" @dragstart="handleSplitterDragStart" @drag="handleSplitterDrag"
            @dragend="handleSplitterDragEnd" draggable="true"></div>
          <EditTimelineFrom v-if="!timeline.selectedEventId && !timeline.selectedGroupId"></EditTimelineFrom>
          <EditEventForm v-if="timeline.selectedEventId" :editEventId="timeline.selectedEventId"></EditEventForm>
          <EditGroupForm v-if="timeline.selectedGroupId" :editGroupId="timeline.selectedGroupId"></EditGroupForm>
        </div>
      </div>
    </v-main>
  </div>

</template>

<script>
import { mapState } from "vuex";
import NavigationBar from "../components/NavigationBar.vue";
import TimelineDays from "../components/TimelineDays.vue";
import TimelineEvents from "../components/TimelineEvents.vue";
import TimelineGroups from "../components/TimelineGroups.vue";
import EditEventForm from "../components/EditEventForm.vue";
import EditTimelineFrom from "../components/EditTimelineForm.vue";
import EditGroupForm from "../components/EditGroupForm.vue";
import { DateTime } from "luxon";
import _ from "lodash";

var dragImage = document.createElement('img');
dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export default {
  name: "TimelineView",

  components: {
    NavigationBar,
    TimelineDays,
    TimelineEvents,
    TimelineGroups,
    EditEventForm,
    EditTimelineFrom,
    EditGroupForm,
  },
  sockets: {
    connect() {
      this.$store.dispatch('timeline/joinTimelineSocketAction');
    },
    reconnect() {
      this.$store.dispatch('timeline/joinTimelineSocketAction');
    }
  },
  mounted() {
    this.panelWidth = localStorage.getItem('rightPanelWidth');
    if (!this.panelWidth)
      this.panelWidth = 300;
    this.$store.dispatch("timeline/loadTimelineAction", {
      timelineId: this.$route.params.timelineId,
    });
    this.$store.dispatch('timeline/joinTimelineSocketAction');
    this.localCellWidth = this.cellWidth;
    this.scrollDate = localStorage.getItem('scrollDate-' + this.$route.params.timelineId);
    if (!this.scrollDate) this.scrollDate = DateTime.now().toISODate();
    this.scrollToScrollDate()
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
      dragStartX: 0,
      panelWidthDragStart: 0,
      panelWidth: 300,
      localCellWidth: 25,
      scrollDate: DateTime.now().toISODate(),
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
        top += groups[i].lines;
      }
      let width = this.cellWidth * (DateTime.fromISO(this.toDate).diff(DateTime.fromISO(this.fromDate), 'days').as('days') + 1);
      return {
        groups: groups,
        height: Math.max(300, top * this.lineHeight) + 'px',
        width: width + 'px'
      };
    },
    scrollTransform: function () {
      return "translate(" + this.scroll.x + ",0)";
    },
    ...mapState(["timeline", "fromDate", "toDate", "cellWidth", "lineHeight"]),
  },
  watch: {
    cellWidth(newVal) {
      this.localCellWidth = newVal;
      this.scrollToScrollDate()
    },
    localCellWidth(newVal) {
      this.setCellWidth(newVal)
    }
  },
  methods: {
    handleScroll: _.debounce(function (currentTarget) {
      if (!currentTarget) return;
      let date = DateTime.fromISO(this.fromDate).plus({ days: Math.round((currentTarget.scrollLeft + 200) / this.cellWidth) }).toISODate();
      this.scrollDate = date;
      localStorage.setItem('scrollDate-' + this.$route.params.timelineId, this.scrollDate);
    }, 100),
    scrollToScrollDate() {
      let scrollVal = Math.max(0, DateTime.fromISO(this.scrollDate).diff(DateTime.fromISO(this.fromDate), "days").as("days") * this.cellWidth - 200)
      this.$refs.timeline.scrollTo({ left: scrollVal })
    },
    handleMouseDown(event) {
      let dayNum = Math.round((event.offsetX - this.scroll.x - 15) / 25);
      let groupNum = -1;
      let line = Math.round((event.offsetY - 15) / 25);
      let h = 0;
      for (let i = 0; i < this.timeline.groups.length; i++) {
        h += this.timeline.groups[i].lines;
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
      this.panelWidth = Math.max(300, this.panelWidthDragStart - e.clientX + this.dragStartX);
    },
    handleSplitterDragEnd() {
      localStorage.setItem('rightPanelWidth', this.panelWidth);
    },
    setCellWidth: _.throttle(function (cellWidth) {
      this.$store.dispatch("setCellWidth", {
        cellWidth: cellWidth,
      });
    }, 50)

  },
};
</script>