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
  cursor: pointer;
  align-items: center;
  border: 1px solid #ffffff00;
  mix-blend-mode: multiply;
  box-shadow: 0px 1px 4px #00000055;
}
.event.selected {
  border: 1px solid #fff;
  box-shadow: 0px 2px 5px #00000088;
}
.eventTitle {
  text-overflow: ellipsis;
  width: 100%;
  margin: 2px 4px;
  font-size: 0.8em;
  line-height: 13px;
  overflow: hidden;
  white-space: nowrap;
}
.newEventHandler {
  position: absolute;
  width: 25px;
  height: 39px;
  background: #fff;
  border-radius: 3px;
  pointer-events: none;
  display:flex;
  align-items: center;
}
.eventContent {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.eventExpander {
  position: absolute;
  right: 0px;
  top: 0px;
  background: #fff;
  width: 5px;
  cursor: col-resize;
  height: 100%;
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
          <div class="eventContent">
            <div class="eventTitle">{{ displayEvent.event.title }}</div>
            <div
              v-if="selectedEventKey == displayEvent.key"
              class="eventExpander"
              @dragstart="handleEventExpanderDragStart($event, displayEvent)"
              @drag="handleEventExpanderDrag($event, displayEvent)"
              @dragend="handleEventExpanderDragEnd($event, displayEvent)"
              draggable="true"
            ></div>
          </div>
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


if(/Firefox\/\d+[\d.]*/.test(navigator.userAgent)
        && typeof window.DragEvent === 'function'
        && typeof window.addEventListener === 'function') (function(){
    // patch for Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=505521
    var cx, cy, px, py, ox, oy, sx, sy, lx, ly;
    function update(e) {
        cx = e.clientX; cy = e.clientY;
        px = e.pageX;   py = e.pageY;
        ox = e.offsetX; oy = e.offsetY;
        sx = e.screenX; sy = e.screenY;
        lx = e.layerX;  ly = e.layerY;
    }
    function assign(e) {
        e._ffix_cx = cx; e._ffix_cy = cy;
        e._ffix_px = px; e._ffix_py = py;
        e._ffix_ox = ox; e._ffix_oy = oy;
        e._ffix_sx = sx; e._ffix_sy = sy;
        e._ffix_lx = lx; e._ffix_ly = ly;
    }
    window.addEventListener('mousemove', update, true);
    window.addEventListener('dragover', update, true);
    // bug #505521 identifies these three listeners as problematic:
    // (although tests show 'dragstart' seems to work now, keep to be compatible)
    window.addEventListener('dragstart', assign, true);
    window.addEventListener('drag', assign, true);
    window.addEventListener('dragend', assign, true);

    var me = Object.getOwnPropertyDescriptors(window.MouseEvent.prototype),
        ue = Object.getOwnPropertyDescriptors(window.UIEvent.prototype);
    function getter(prop,repl) {
        return function() {return me[prop] && me[prop].get.call(this) || Number(this[repl]) || 0};
    }
    function layerGetter(prop,repl) {
        return function() {return this.type === 'dragover' && ue[prop] ? ue[prop].get.call(this) : (Number(this[repl]) || 0)};
    }
    Object.defineProperties(window.DragEvent.prototype,{
        clientX: {get: getter('clientX', '_ffix_cx')},
        clientY: {get: getter('clientY', '_ffix_cy')},
        pageX:   {get: getter('pageX', '_ffix_px')},
        pageY:   {get: getter('pageY', '_ffix_py')},
        offsetX: {get: getter('offsetX', '_ffix_ox')},
        offsetY: {get: getter('offsetY', '_ffix_oy')},
        screenX: {get: getter('screenX', '_ffix_sx')},
        screenY: {get: getter('screenY', '_ffix_sy')},
        x:       {get: getter('x', '_ffix_cx')},
        y:       {get: getter('y', '_ffix_cy')},
        layerX:  {get: layerGetter('layerX', '_ffix_lx')},
        layerY:  {get: layerGetter('layerY', '_ffix_ly')}
    });
})();

export default {
  data: function () {
    return {
      selectedEventKey: -1,
      dragStart: {},
      expanderDragStart: {},
      handlerPos: { x: -100, y: -100 },
      selectedLocalEvent: null,
    };
  },
  computed: {
    display() {
      let groups = [];
      let top = 0;
      for (let i = 0; i < this.timeline.groups.length; i++) {
        let group = this.timeline.groups[i];
        let displayGroup = {
          top: top,
          group: group,
        };
        groups.push(displayGroup);
        let renderedEvents = [];
        for (let j = 0; j < group.events.length; j++) {
          let event = group.events[j];
          let renderedEvent = {
            key: event._id,
            event: event,
            group: group,
            startcellnum: Math.ceil(
              (new Date(event.date_start) - new Date(this.fromDate)) /
                (1000 * 60 * 60 * 24)
            ),
          };
          renderedEvents.push(Object.assign({}, renderedEvent));
          if (event.period+0) {
            let k = 0;
            while (
              renderedEvent.startcellnum <
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
              renderedEvent.startcellnum += parseInt(event.period);
              renderedEvents.push(Object.assign({}, renderedEvent));
            }
          }
        }
        displayGroup.events = renderedEvents;
        top += group.height;
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
        ).groupId == displayGroup.group._id
      ) {
        style += "background:#00000011;";
      }
      return style;
    },
    getEventStyle(displayEvent) {
      let style = "";
      style += "background-color:" + displayEvent.group.background + ";";
      style += "color:" + displayEvent.group.foreground + ";";
      style += "left:" + displayEvent.startcellnum * this.cellWidth + "px;";
      style += "top:" + displayEvent.event.line * this.lineHeight + "px;";
      style += "width:" + displayEvent.event.duration * this.cellWidth + "px;";
      return style;
    },
    handleMouseMove(e) {
      if (e.target.className != "group" && e.target.className != "groups") {
        this.handlerPos = {
          x: -100,
          y: -100,
        };
        return;
      }
      let rect = e.currentTarget.getBoundingClientRect();
      this.handlerPos = {
        x:
          Math.round(
            (e.screenX - rect.left - this.cellWidth / 2) / this.cellWidth
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
          (e.screenX - rect.left - this.cellWidth / 2) / this.cellWidth
        );
        let groupNum = this.timeline.groups.length - 1;
        let line = Math.round(
          (e.screenY - rect.top - this.lineHeight / 2) / this.lineHeight
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
        date_start: displayEvent.event.date_start,
        startcellnum: displayEvent.startcellnum,
        duration: displayEvent.event.duration
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
    handleEventExpanderDragStart(e, displayEvent) {
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      this.expanderDragStart = {
        x: e.clientX,
        duration: displayEvent.event.duration,
      };
      e.stopPropagation();
    },
    handleEventExpanderDrag(e, displayEvent) {
      if (!e.clientX) return;
      let event = this.$store.getters["timeline/getEventById"](
        displayEvent.event._id
      );
      let cellsDiff = Math.round(
        (e.clientX - this.expanderDragStart.x) / this.cellWidth
      );
      let duration = Math.max(1, this.expanderDragStart.duration + cellsDiff);
      Vue.set(event, "duration", duration);
      this.$store.dispatch("selectEventAction", {
        event: this.selectedLocalEvent.event,
        startcellnum: displayEvent.startcellnum,
        duration: duration
      });
      e.stopPropagation();
    },
    handleEventExpanderDragEnd(e, displayEvent) {
      this.$store.dispatch("timeline/updateEventAction", {
        eventId: displayEvent.event._id,
        changes: { duration: displayEvent.event.duration },
      });
      e.stopPropagation();
    },
    handleEventDragStart(e, displayEvent) {
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      this.dragStart = {
        event:displayEvent,
        x: e.clientX,
        date_start: displayEvent.event.date_start,
        startcellnum: displayEvent.startcellnum,
        duration: displayEvent.event.duration
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
      displayEvent.startcellnum = this.dragStart.startcellnum + cellsDiff;
      if (this.timeline.selectedEventId == displayEvent.event._id) {
        this.$store.dispatch("selectEventAction", {
          event: this.selectedLocalEvent.event,
          date_start: displayEvent.event.date_start,
          startcellnum: displayEvent.startcellnum,
          duration: displayEvent.event.duration
        });
      }
    },
    handleEventDragEnd(e, displayEvent) {
      this.$store.dispatch("timeline/updateEventAction", {
        eventId: displayEvent.event._id,
        changes: { date_start: displayEvent.event.date_start },
      });
    },
  },
};
</script>
