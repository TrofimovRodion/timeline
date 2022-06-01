<style scoped>
.groups {
  position: relative;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.group {
  position: absolute;
  border-bottom: 1px solid #fff;
  width: 100%;
  overflow: hidden;
}
.groupEvents {
  position: relative;
  margin: 5px 0;
}
.event {
  position: absolute;
  height: 29px;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  cursor: pointer;
  align-items: center;
  border: 1px solid #ffffff00;
  mix-blend-mode: multiply;
  box-shadow: 0px 1px 4px #00000055;
}
.event.selected {
  border: 1px solid #fff;
}
.eventTitle {
  text-overflow: ellipsis;
  width: 100%;
  margin: 2px 4px;
  font-size: 0.8em;
}
.newEventHandler {
  position: absolute;
  width: 25px;
  height: 39px;
  background: #fff;
  display: flex;
  align-items: center;
  border-radius: 3px;
  pointer-events: none;
}
</style>
<template>
  <div
    class="groups"
    @click="handleClickCanvas($event)"
    @mousemove="handleMouseMove($event)"
    @mouseout="handlerPos = { x: -100, y: -100 }"
  >
    <div class="newEventHandler" :style="newEventHandlerStyle">
      <v-icon>mdi-plus</v-icon>
    </div>
    <div
      class="group"
      v-for="displayGroup in display.groups"
      :key="displayGroup.group._id"
      :style="getGroupStyle(displayGroup)"
    >
      <div class="groupEvents">
        <div
          v-for="displayEvent in displayGroup.events"
          :key="displayEvent.key"
          :class="
            `event` + (selectedEventKey == displayEvent.key ? ` selected` : ``)
          "
          :style="getEventStyle(displayEvent)"
          @click="selectEvent($event, displayEvent)"
          @dragstart="handleEventDragStart($event, displayEvent)"
          @drag="handleEventDrag($event, displayEvent)"
          @dragend="handleEventDragEnd($event, displayEvent)"
          draggable="true"
        >
          <div class="eventTitle">{{ displayEvent.event.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { mapState } from "vuex";
import { DateTime } from "luxon";

var dragImage = document.createElement("img");
dragImage.src =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default {
  data: function () {
    return {
      selectedEventKey: -1,
      dragStart: {},
      handlerPos: { x: -100, y: -100 },
      selectedLocalEvent: null,
    };
  },
  computed: {
    display() {
      let groups = [];
      let top = 0;
      for (let i = 0; i < this.timeline.groups.length; i++) {
        let displayGroup = {
          top: top,
          group: this.timeline.groups[i],
        };
        groups.push(displayGroup);
        let renderedEvents = [];
        for (let j = 0; j < displayGroup.group.events.length; j++) {
          let event = displayGroup.group.events[j];
          let renderedEvent = {
            key: event._id,
            event: event,
            startdaynum: Math.ceil(
              (new Date(event.date_start) - new Date(this.fromDate)) /
                (1000 * 60 * 60 * 24)
            ),
          };
          renderedEvents.push(Object.assign({}, renderedEvent));
          if (event.period) {
            let k = 0;
            while (
              renderedEvent.startdaynum <
              Math.min(
                1000,
                Math.ceil(
                  Math.abs(new Date(this.toDate) - new Date(event.date_start)) /
                    (1000 * 60 * 60 * 24)
                )
              )
            ) {
              k++;
              renderedEvent.key = event._id + "_" + k;
              renderedEvent.startdaynum += parseInt(event.period);
              renderedEvents.push(Object.assign({}, renderedEvent));
            }
          }
        }
        displayGroup.events = renderedEvents;
        top += displayGroup.group.height;
      }

      return {
        groups: groups,
      };
    },
    newEventHandlerStyle() {
      let style = "";
      if (this.timeline.selectedEventId) {
        style += "display:none;";
      } else {
        style += "left:" + this.handlerPos.x + "px;";
        style += "top:" + this.handlerPos.y + "px;";
      }
      return style;
    },
    ...mapState(["timeline", "fromDate", "toDate", "lineHeight", "cellWidth"]),
  },
  methods: {
    getGroupStyle(displayGroup) {
      let style = "";
      style += "top:" + displayGroup.top * this.lineHeight + "px;";
      style += "height:" + displayGroup.group.height * this.lineHeight + "px;";
      if (
        this.timeline.selectedEventId &&
        this.$store.getters["timeline/getEventById"](
          this.timeline.selectedEventId
        ).group._id == displayGroup.group._id
      ) {
        style += "background:#00000011;";
      }
      return style;
    },
    getEventStyle(displayEvent) {
      let style = "";
      style += "background-color:" + displayEvent.event.group.background + ";";
      style += "color:" + displayEvent.event.group.foreground + ";";
      style += "left:" + displayEvent.startdaynum * this.cellWidth + "px;";
      style += "top:" + displayEvent.event.line * this.lineHeight + "px;";
      style += "width:" + displayEvent.event.duration * this.cellWidth + "px;";
      return style;
    },
    handleMouseMove(e) {
      if (e.target.className!='group' && e.target.className!='groups') {
        this.handlerPos = {
          x:-100,y:-100
        }
        return;
      }
      let rect = e.currentTarget.getBoundingClientRect();
      this.handlerPos = {
        x:
          Math.round(
            (e.clientX - rect.left - this.cellWidth / 2) / this.cellWidth
          ) * this.cellWidth,
        y:
          Math.round(
            (e.clientY - rect.top - this.lineHeight / 2) / this.lineHeight
          ) * this.lineHeight,
      };
    },
    handleClickCanvas(e) {
      if (this.timeline.selectedEventId) {
        this.deselectEvent();
      } else {
        let rect = e.currentTarget.getBoundingClientRect();
        let dayNum = Math.round(
          (e.clientX - rect.left - this.cellWidth / 2) / this.cellWidth
        );
        let groupNum = this.timeline.groups.length-1;
        let line = Math.round(
          (e.clientY - rect.top - this.lineHeight / 2) / this.lineHeight
        );
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
        this.$store.dispatch("timeline/createEventAction", {
          groupNum: groupNum,
          eventDetails: {
            date_start: startDate.toISOString().slice(0, 10),
          },
        });
      }
    },
    selectEvent(e, displayEvent) {
      this.timeline.selectedEventId = displayEvent.event._id;
      this.selectedEventKey = displayEvent.key;
      this.$store.dispatch("selectEventAction", {
        event: displayEvent.event,
        startdaynum: displayEvent.startdaynum,
      });
      this.selectedLocalEvent = displayEvent;
      e.stopPropagation();
    },
    deselectEvent() {
      this.selectedLocalEvent = null;
      this.timeline.selectedEventId = 0;
      this.selectedEventKey = -1;
      this.$store.dispatch("selectEventAction", { event: null });
    },
    handleEventDragStart(e, displayEvent) {
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      this.dragStart = {
        x: e.clientX,
        date_start: displayEvent.event.date_start,
        startdaynum: displayEvent.startdaynum,
      };
    },
    handleEventDrag(e, displayEvent) {
      if (!e.clientX) return;
      let event = this.$store.getters["timeline/getEventById"](
        displayEvent.event._id
      );
      let cellsDiff = Math.round(
        (e.clientX - this.dragStart.x) / this.cellWidth
      );
      let date_start = DateTime.fromISO(this.dragStart.date_start)
        .plus({ days: cellsDiff })
        .toISODate();
      Vue.set(event, "date_start", date_start);
      displayEvent.startdaynum = this.dragStart.startdaynum + cellsDiff;
      if (this.timeline.selectedEventId == displayEvent.event._id) {
        this.$store.dispatch("selectEventAction", {
          event: this.selectedLocalEvent.event,
          startdaynum: displayEvent.startdaynum,
        });
      }
    },
    handleEventDragEnd(e, displayEvent) {
      let event = this.$store.getters["timeline/getEventById"](
        displayEvent.event._id
      );
      this.$store.dispatch("timeline/updateEventAction", {
        event: event,
        changes: { date_start: displayEvent.event.date_start },
      });
    },
  },
};
</script>
