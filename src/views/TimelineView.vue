<style scoped>
@import "../assets/css.css";
</style>

<template>
  <div style="height:100%">
    <NavigationBar></NavigationBar>
    <v-main style="height:100%">
      <div class="panels" ref="panels">
        <div class="panel mainPanel" ref="mainPanel">
          <EditEventDialog
            :editEventId="editEventId"
            :display="editDialog.display"
            @close="saveEventDialog"
          />
          <EditGroupDialog
            :editGroupId="editGroupId"
            :display="editGroupDialog.display"
            @close="saveGroupDialog"
          />

          <div id="timeline" class="timelineWrap">
            <TimelineDays></TimelineDays>
            <TimelineEvents></TimelineEvents>
            <!--<svg
              class="timeline"
              v-on:wheel="handleScroll"
              v-on:scroll="handleScrollTouch"
              v-on:touchstart="dragStartHandler"
              v-on:touchmove="movingHandler"
              v-on:mouseover="handleMouseOver"
              v-on:mouseout="handleMouseOut"
              v-on:mousemove="handleMouseMove"
            >
              <g></g>
              <g :transform="scrollTransform">
                <rect
                  :x="handlerX"
                  :y="handlerY"
                  rx="4"
                  ry="4"
                  width="25"
                  height="25"
                  :style="`display:${handlerDisplay};fill:rgb(255, 255, 255);opacity:0.2`"
                  v-on:click="handleMouseDown"
                />
                <svg x="0" y="0" style="overflow: visible">
                  <svg
                    v-for="(group, groupNum) in display.groups"
                    :key="group._id + '000'"
                    x="0"
                    :y="25 * group.top"
                    style="overflow: visible"
                  >
                    <svg
                      v-for="(event, eventNum) in group.events"
                      :key="event.key"
                      :x="event.startdaynum * 25"
                      :y="25 * event.line"
                      :width="25 * event.duration"
                      height="25"
                      style="overflow: hidden"
                      v-on:click="handleClickEvent(groupNum, eventNum)"
                    >
                      <title>{{ event.title }}</title>
                      <rect
                        x="1"
                        y="0"
                        rx="3"
                        ry="3"
                        :width="25 * event.duration"
                        height="24"
                        :style="`fill:${group.background}`"
                      />
                      <text
                        x="5"
                        y="18"
                        :width="25 * event.duration - 5"
                        :style="`fill:${group.foreground}`"
                      >
                        {{ event.title }}
                      </text>
                    </svg>
                  </svg>
                </svg>
                
              </g>

              <svg x="0" y="0" style="overflow: visible">
                <rect
                  x="0"
                  y="0"
                  :width="leftBlockWidth"
                  height="100%"
                  style="fill: #d9d9d9"
                />
                <rect
                  :x="leftBlockWidth - 1"
                  y="0"
                  width="1"
                  height="100%"
                  style="fill: #f9f9f9"
                />
                <rect
                  :x="leftBlockWidth - 5"
                  y="50%"
                  width="5"
                  height="20"
                  style="fill: rgb(17, 17, 17); opacity: 0.5"
                  v-on:mousedown="handleDrag"
                />
                <svg
                  v-for="group in display.groups"
                  :key="group._id"
                  x="0"
                  :y="46 * group.top"
                  v-on:click="handleClickGroup(group._id)"
                >
                  <rect
                    x="0"
                    y="0"
                    :width="leftBlockWidth"
                    :height="46 * group.height - 1"
                    :style="`fill:${group.background};opacity:0.5`"
                  />
                  <foreignObject
                    x="5"
                    y="5"
                    class="groupTitleWrap"
                    :width="leftBlockWidth - 10"
                    :height="46 * group.height - 10"
                  >
                    <span
                      class="groupTitle"
                      xmlns="http://www.w3.org/1999/xhtml"
                      >{{ group.title }}</span
                    >
                  </foreignObject>
                </svg>
              </svg>
            </svg>-->
          </div>
        </div>
          <div class="panel rightPanel" :style="`min-width:`+panelWidth+`px`" ref="rightPanel">
            <div class="panelSplitter"
              v-on:dragstart="handleSplitterDragStart"
              v-on:drag="handleSplitterDrag"
              v-on:dragend="handleSplitterDragEnd"
              draggable="true"
              ></div>
          <v-container>
            <h2>Options</h2>
            <v-text-field
                label="Title"
                :value="timeline.timeline.title"
                @input="handleInputTitle"
                placeholder="Untitled timeline" persistent-placeholder
              ></v-text-field>
            <v-textarea label="Changelog" placeholder="No changes yet" persistent-placeholder>

            </v-textarea>
          </v-container>
          </div>
        </div>
    </v-main>
  </div>
</template>

<script>
import { mapState } from "vuex";
import EditEventDialog from "../components/EditEventDialog.vue";
import EditGroupDialog from "../components/EditGroupDialog.vue";
import NavigationBar from "../components/NavigationBar.vue";
import TimelineDays from "../components/TimelineDays.vue";
import TimelineEvents from "../components/TimelineEvents.vue";
import _ from 'lodash'

var dragImage = document.createElement('img');
dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export default {
  name: "TimelineView",

  components: {
    EditEventDialog,
    EditGroupDialog,
    NavigationBar,
    TimelineDays,
    TimelineEvents
  },
  mounted() {
    this.panelWidth = localStorage.getItem('rightPanelWidth');
    if (!this.panelWidth) 
      this.panelWidth = 200;
    this.$store.dispatch("timeline/loadTimelineAction", {
      timelineId: this.$route.params.timelineId,
    });
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
      panelWidth:200
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
          event.startdaynum = Math.ceil(
            Math.abs(new Date(event.date_start) - new Date(this.fromDate)) /
              (1000 * 60 * 60 * 24)
          );
          renderedEvents.push(Object.assign({}, event));
          if (event.period) {
            let k = 0;
            while (
              event.startdaynum <
              Math.min(
                1000,
                Math.ceil(
                  Math.abs(new Date(this.toDate) - new Date(event.date_start)) /
                    (1000 * 60 * 60 * 24)
                )
              )
            ) {
              k++;
              event.key = event._id + "_" + k;
              event.startdaynum += parseInt(event.period);
              renderedEvents.push(Object.assign({}, event));
            }
          }
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
    ...mapState(["timeline", "fromDate", "toDate"]),
  },
  methods: {
    moveBy: function (deltaX) {
      this.scroll.x = Math.min(
        this.leftBlockWidth,
        Math.max(-this.display.maxX + 10, this.scroll.x + deltaX)
      );
    },
    handleScroll(event) {
      event.stopPropagation();
      event.preventDefault();
      this.moveBy(-event.deltaX);
      return false;
    },
    handleScrollTouch() {
      console.log("scroll");
    },
    dragStartHandler(event) {
      this.scroll.touchStartX = event.touches[0].clientX;
      event.stopPropagation();
    },
    movingHandler(event) {
      this.moveBy(event.touches[0].clientX - this.scroll.touchStartX);
      this.scroll.touchStartX = event.touches[0].clientX;
      event.stopPropagation();
    },
    handleDrag() {
      console.log("drag");
    },
    handleMouseOver() {
      this.handlerDisplay = "block";
    },
    handleMouseOut() {
      this.handlerDisplay = "none";
      this.highlightedDayNum = -1;
    },
    handleMouseMove(event) {
      this.handlerX =
        Math.round((event.offsetX - this.scroll.x - 15) / 25) * 25;
      this.handlerY = Math.round((event.offsetY - 15) / 25) * 25;
      this.highlightedDayNum = Math.round(
        (event.offsetX - this.scroll.x - 15) / 25
      );
    },
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
        //line:line-this.timeline.groups[groupNum].top,
        //date_start: new Date(this.display.days[dayNum].date),
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
      //e.dataTransfer.setData('text/plain', 'This text may be dragged')
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      this.panelWidthDragStart = this.panelWidth;
    },
    handleSplitterDrag(e) {
      //console.log(e.screenX - this.dragStartX);
      if (!e.clientX) return;
      this.panelWidth = this.panelWidthDragStart - e.clientX + this.dragStartX;
    },
    handleSplitterDragEnd() {
      localStorage.setItem('rightPanelWidth', this.panelWidth);
    },
    handleInputTitle: _.debounce(function(newTitle) {
      this.$store.dispatch("timeline/updateTimelineAction",{
        timeline:this.timeline.timeline,
        changes:{
          title:newTitle
        }
      });
    }, 300)

  },
};
</script>