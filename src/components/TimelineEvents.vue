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
.groupTitle {
  position:sticky;
  left:0px;
}
.groupEvents {
  position: relative;
  margin: 5px 0;
}
.event {
  position: absolute;
  height: 29px;
  border-radius: 3px;
  cursor: pointer;
  align-items: center;
  border: 1px solid #ffffff00;
  mix-blend-mode: multiply;
  box-shadow: 0px 1px 4px #00000055;
}
.event:hover {
  text-decoration:underline;
  box-shadow: 0px 3px 7px #00000055;
}
.event.selected {
  border: 1px solid #00000055;
  outline: 2px solid #fffffff0;
  box-shadow: 0px 2px 5px #00000088;
}
.event.connectionTarget {
  outline: 2px solid #ff4422f0;
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
  justify-content:center;
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
  background: #ffffff99;
  width: 5px;
  cursor: col-resize;
  height: 100%;
}
.eventExpander:hover {
  background: #fff;

}
.eventDependanceSocket {
  position: absolute;
  left:-8px;
  top:50%;
  width:5px; height:10px;
  margin-top:-5px;
  border-radius: 5px 0 0 5px;
  background:#00000055;
  border: 1px solid #00000055;
  border-width: 1px 0 1px 1px;
  outline: 2px solid #fffffff0;
  box-shadow: 0px 2px 5px #00000088;
}
.eventDependanceSocket:hover {
  background:#00000099;
  border: 1px solid #00000099;
}
</style>
<template>
  <div
    class="groups"
    ref="group"
    @click="handleClickCanvas($event)"
    @mousemove="handleMouseMove($event)"
    @mouseout="handlerPos = { x: -100, y: -100 }"
  >
    <div class="newEventHandler" :style="newEventHandlerStyle">
      <v-icon>mdi-plus</v-icon>
    </div>
    <svg :style="{
      pointerEvents:'none',
      position:'absolute',
      width:display.width+'px',
      height:display.height+'px'
      }">
      <marker xmlns="http://www.w3.org/2000/svg" id="triangle" viewBox="0 0 10 10" refX="0" refY="5" markerUnits="strokeWidth" markerWidth="6" markerHeight="4" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z"/>
      </marker>
      <path
        :d="connectionPath"
        style="pointer-events:none"
        marker-end="url(#triangle)"
        stroke="#00000088"
        stroke-width="1"
        fill="transparent"/>
      <path
        v-for="connection in display.connections"
        :d="connection.path"
        :key = "connection.key"
        style="pointer-events:none"
        marker-end="url(#triangle)"
        stroke="#00000088"
        stroke-width="1"
        fill="transparent"/>
    </svg>
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
            `event` + ((timeline.selectedEventId == displayEvent.event._id && timeline.selectedEventRepeatNum == displayEvent.repeatNum) ? ` selected` : ``)
            + ((connection.started&&connection.targetEventId == displayEvent.event._id)?` connectionTarget`:``)
          "
          :style="getEventStyle(displayEvent)"
          @click="selectEvent($event, displayEvent)"
          @dragstart="handleEventDragStart($event, displayEvent)"
          @drag="handleEventDrag($event, displayEvent)"
          @dragend="handleEventDragEnd($event, displayEvent)"
          @drop.prevent="handleEventDrop($event, displayEvent)"
          @dragenter.prevent="handleEventDragEnter($event, displayEvent)"
          @dragleave.prevent = "handleEventDragLeave($event, displayEvent)"
          @dragover.prevent = "handleEventDragOver($event, displayEvent)"
          draggable="true"
        >
          <div class="eventContent">
            <div 
              v-if="timeline.selectedEventId == displayEvent.event._id && timeline.selectedEventRepeatNum == displayEvent.repeatNum"
              class="eventDependanceSocket"
              @dragstart="handleEventDependanceDragStart($event, displayEvent)"
              @drag="handleEventDependanceDrag($event, displayEvent)"
              @dragend="handleEventDependanceDragEnd($event, displayEvent)"
              draggable="true"
            ></div>
            <div class="eventTitle">{{ displayEvent.event.title }}</div>
            <div
              v-if="timeline.selectedEventId == displayEvent.event._id && timeline.selectedEventRepeatNum == displayEvent.repeatNum"
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
//import Vue from "vue";
import { mapState } from "vuex";
import { DateTime } from "luxon";
import { getContrastColor } from '../utils/index'
import { roundCorners } from 'svg-round-corners';

import _ from "lodash";

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
      connection: {
        started:false,
        startX:0,
        startY:0,
        currentX:0,
        currentY:0,
        sourceEventId:null,
        targetEventId:null
      },
      dragStart: {},
      expanderDragStart: {},
      handlerPos: { x: -100, y: -100 },
      movedEvents: [],
      updatedMovedEvents:[]
    };
  },
  computed: {
    connectionPath() {
      if (!this.connection.started) return ""
      let res = "";
      if (!this.connection.targetEventId) {
        let diffX = Math.round(this.connection.currentX - this.connection.startX)
        let diffY = Math.round(this.connection.currentY - this.connection.startY)
        let signY = diffY>=0?1:-1
        let addY = diffX<=-10?0:signY*(this.lineHeight/2)
        res = "M "+Math.round(this.connection.startX)+" "+Math.round(this.connection.startY)
          +(diffX<=-10?(" l "+(diffX)+" 0"):
            (" l -10 0 l 0 "+addY+" l "+(diffX+10)+" 0")
          )
          +" l 0 " +(diffY-addY);
        res = roundCorners(res, 8).path;
      } else {
        let diffX = Math.round(this.connection.endX+15 - this.connection.startX)
        let diffY = Math.round(this.connection.endY - this.connection.startY)
        let signY = diffY>=0?1:-1
        let addY = diffX<=-10?0:signY*(this.lineHeight/2)
        res = "M "+Math.round(this.connection.startX)+" "+Math.round(this.connection.startY)
          +(diffX<=-10?(" l "+(diffX)+" 0"):
            (" l -10 0 l 0 "+addY+" l "+(diffX+10)+" 0")
          )
          +" l 0 " +(diffY-addY)
          +" l -9 0"
        res = roundCorners(res, 8).path;
      }
      return res;
    },
    selectedLocalEvent () {
      for (let g=0;g<this.display.groups.length; g++) {
        for (let e=0;e<this.display.groups[g].events.length; e++) {
          if (this.display.groups[g].events[e].event._id == this.timeline.selectedEventId && this.display.groups[g].events[e].repeatNum == this.timeline.selectedEventRepeatNum) {
            return this.display.groups[g].events[e]
          }
        }
      }
      return null;
    },
    display() {
      let groups = [];
      let top = 0;
      let width = DateTime.fromISO(this.toDate).diff(DateTime.fromISO(this.fromDate)).as('days');
      let allEvents = {};
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
            repeatNum: 0,
            event: event,
            group: group,
            displayGroup:displayGroup,
            line:event.line,
            startcellnum: Math.ceil(
              (new Date(event.date_start) - new Date(this.fromDate)) /
                (1000 * 60 * 60 * 24)
            ),
            connections:[]
          };
          let newEvent = Object.assign({}, renderedEvent);
          allEvents[event._id+'-0'] = newEvent;
          renderedEvents.push(newEvent);
          if (event.period+0) {
            let k = 0;
            while (
              renderedEvent.startcellnum <
              Math.min(
                10000,
                event.date_repeatable_end ? 
                DateTime.fromISO(event.date_repeatable_end).diff(DateTime.fromISO(this.fromDate)).as('days'):10000,
                width
              )
            ) {
              k++;
              renderedEvent.key = event._id + "_" + k;
              renderedEvent.repeatNum = k;
              renderedEvent.startcellnum += parseInt(event.period);
              let newEvent = Object.assign({}, renderedEvent);
              renderedEvents.push(newEvent);
              allEvents[event._id+'-'+k] = newEvent;
            }
          }
        }
        displayGroup.events = renderedEvents;
        top += group.lines;
      }
      let connections = [];
      for (let i=0;i<this.timeline.connections.length;i++) {
        let conn = this.timeline.connections[i];
        let fromEvent = allEvents[conn.eventId+'-'+conn.eventRepeatNum];
        let toEvent = allEvents[conn.targetEventId+'-'+conn.targetEventRepeatNum];
        if (!toEvent || !fromEvent) continue;
        toEvent.connections.push(fromEvent);
        let newConnection = {
          path:this.getConnectionPath(
            fromEvent.startcellnum * this.cellWidth,
            (fromEvent.displayGroup.top + fromEvent.line + 0.5) * this.lineHeight,
            (toEvent.startcellnum + toEvent.event.duration) * this.cellWidth,
            (toEvent.displayGroup.top + toEvent.line + 0.5) * this.lineHeight),
          key:conn.eventId + "-"+conn.targetEventId+"-"+conn.targetEventRepeatNum
        }
        connections.push(newConnection);
      }
      return {
        groups: groups,
        connections: connections,
        width: width*this.cellWidth,
        height: top*this.lineHeight,
      };
    },
    newEventHandlerStyle() {
      let style = "min-width:"+this.cellWidth+"px;";
      if (this.timeline.selectedEventId || this.timeline.selectedGroupId) {
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
    getConnectionPath(startX,startY,endX,endY){
      let res = '';
      let diffX = Math.round(endX+15 - startX)
      let diffY = Math.round(endY - startY)
      let signY = diffY>=0?1:-1
      let addY = diffX<=-10?0:signY*(this.lineHeight/2)
      res = "M "+Math.round(startX)+" "+Math.round(startY)
        +(diffX<=-10?(" l "+(diffX)+" 0"):
          (" l -10 0 l 0 "+addY+" l "+(diffX+10)+" 0")
        )
        +" l 0 " +(diffY-addY)
        +" l -9 0"
      res = roundCorners(res, 8).path;
      return res;
    },
    getGroupStyle(displayGroup) {
      let style = "";
      style += "top:" + displayGroup.top * this.lineHeight + "px;";
      style += "min-height:" + displayGroup.group.lines * this.lineHeight + "px;";
      if (
        (this.timeline.selectedEventId &&
        this.$store.getters["timeline/getEventById"](
          this.timeline.selectedEventId
        ).groupId == displayGroup.group._id) ||
        (this.timeline.selectedGroupId == displayGroup.group._id)
      ) {
        style += "background:#00000008;";
      }
      return style;
    },
    getEventStyle(displayEvent) {
      let style = "";
      let color = (displayEvent.event.color ? displayEvent.event.color: displayEvent.group.background);
      style += "background-color:" + color + ";";
      style += "color:" + getContrastColor(color) + ";";
      style += "left:" + displayEvent.startcellnum * this.cellWidth + "px;";
      style += "top:" + displayEvent.line * this.lineHeight + "px;";
      style += "width:" + (displayEvent.event.duration * this.cellWidth-1) + "px;";
      return style;
    },
    handleEventDependanceDragStart(e, displayEvent) {
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      this.connection.started = true
      this.connection.sourceEventId = displayEvent.event._id
      this.connection.sourceEventRepeatNum = displayEvent.repeatNum
      let canvasRect = this.$refs.group.getBoundingClientRect();
      let elRect = e.currentTarget.getBoundingClientRect();
      //this.connection.sourceElement = e.path.find((el)=>{return el.classList.contains('event')})
      this.connection.startX = elRect.left - canvasRect.left;//this.connection.sourceElement.offsetLeft;
      this.connection.startY = elRect.top - canvasRect.top + 4;//this.connection.sourceElement.offsetTop;
      e.stopPropagation();
    },
    handleEventDependanceDrag(e) {
      if (e.clientX) {
        let canvasRect = this.$refs.group.getBoundingClientRect();
        this.connection.currentX = e.clientX - canvasRect.left
        this.connection.currentY = e.clientY - canvasRect.top
      }
      e.stopPropagation();
    },
    handleEventDependanceDragEnd(e) {
      if (!this.connection.started) return;
      this.connection.started = false
      if (!this.connection.targetEventId) {
        this.$store.dispatch('timeline/disconnectEventsAction', {eventId:this.connection.sourceEventId});
      }
      e.stopPropagation();
    },
    handleEventDrop() {
      if (!this.connection.started) return;
      this.connection.started = false
      this.$store.dispatch('timeline/connectEventsAction',{
        eventId:this.connection.sourceEventId,
        eventRepeatNum:this.connection.sourceEventRepeatNum,
        targetEventId:this.connection.targetEventId,
        targetEventRepeatNum:this.connection.targetEventRepeatNum
      });
    },
    handleEventDragEnter(e, displayEvent) {
      if (this.connection.sourceEventId!=displayEvent.event._id) {
        this.connection.targetEventId = displayEvent.event._id
        this.connection.targetEventRepeatNum = displayEvent.repeatNum
        this.connection.endX = (displayEvent.startcellnum+displayEvent.event.duration) * this.cellWidth
        this.connection.endY = (displayEvent.displayGroup.top+displayEvent.line+0.5) * this.lineHeight - 2
      }
      e.preventDefault()
      e.stopPropagation()
    },
    handleEventDragOver(e, displayEvent) {
      if (this.connection.sourceEventId!=displayEvent.event._id) {
        this.connection.targetEventId = displayEvent.event._id
        this.connection.targetEventRepeatNum = displayEvent.repeatNum
        this.connection.endX = (displayEvent.startcellnum+displayEvent.event.duration) * this.cellWidth
        this.connection.endY = (displayEvent.displayGroup.top+displayEvent.line+0.5) * this.lineHeight - 2
      }
      e.preventDefault()
      e.stopPropagation()
    },
    handleEventDragLeave(e) {
      this.connection.targetEventId = null
      this.connection.endX = null
      this.connection.endY = null
      e.preventDefault()
      e.stopPropagation()
    },
    handleMouseMove(e) {
      if (e.target.className != "group" && e.target.className.indexOf('groups') == -1) {
        this.handlerPos.x = -100
        this.handlerPos.y = -100
        return;
      }
      let rect = e.currentTarget.getBoundingClientRect();
      this.handlerPos.x = Math.round(
            (e.screenX - rect.left - this.cellWidth / 2) / this.cellWidth
          ) * this.cellWidth;
      this.handlerPos.y = Math.round(
            (e.clientY - rect.top - this.lineHeight / 2) / this.lineHeight
          ) * this.lineHeight;
    },
    handleClickCanvas(e) {
      if (this.timeline.selectedEventId) {
        this.deselectEvent();
      } else if (this.timeline.selectedGroupId) {
        this.$store.dispatch("selectGroupAction", { group: null });
      } else {
        let rect = e.currentTarget.getBoundingClientRect();
        let dayNum = Math.round(
          (e.clientX - rect.left - this.cellWidth / 2) / this.cellWidth
        );
        let groupNum = this.timeline.groups.length - 1;
        let line = Math.round(
          (e.clientY - rect.top - this.lineHeight / 2) / this.lineHeight
        );
        let h = 0;
        let group = null
        for (let i = 0; i < this.timeline.groups.length; i++) {
          h += this.timeline.groups[i].lines;
          if (line < h) {
            groupNum = i;
            group = this.timeline.groups[i];
            break;
          }
        }
        let startDate = new Date(this.fromDate);
        startDate.setDate(startDate.getDate() + dayNum);
        this.$store.dispatch("timeline/createEventAction", {
          groupNum: groupNum,
          eventDetails: {
            date_start: startDate.toISOString().slice(0, 10),
            line:line-group.top
          },
        });
      }
    },
    selectEvent(e, displayEvent) {
      this.$store.dispatch("selectEventAction", {
        eventId: displayEvent.event._id,
        repeatNum: displayEvent.repeatNum,
      });
      e.stopPropagation();
    },
    deselectEvent() {
      this.$store.dispatch("selectEventAction", { eventId: null });
    },
    handleEventExpanderDragStart(e, displayEvent) {
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      this.expanderDragStart = {
        x: e.clientX,
        duration: displayEvent.event.duration,
      };
      e.stopPropagation();
    },

    handleEventExpanderDrag:function(e, displayEvent) {
      if (!e.clientX) return;
      this.handleEventExpanderDragThrottle(e,displayEvent);
      e.stopPropagation();
    },
    handleEventExpanderDragThrottle:_.throttle(function (e,displayEvent) {
        let event = this.$store.getters["timeline/getEventById"](
          displayEvent.event._id
        );
        let cellsDiff = Math.round(
          (e.clientX - this.expanderDragStart.x) / this.cellWidth
        );
        let duration = Math.max(1, this.expanderDragStart.duration + cellsDiff);
        if(event.duration!=duration) {
          event.duration = duration;
          this.$store.dispatch("selectEventAction", {
            eventId: this.selectedLocalEvent.event._id,
            repeatNum: this.selectedLocalEvent.repeatNum
          });
        }
      },10),
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
        y: e.clientY,
        date_start: displayEvent.event.date_start,
        line: displayEvent.line,
        startcellnum: displayEvent.startcellnum,
        duration: displayEvent.event.duration
      };
    },
    moveEvent:function (displayEvent, cellsDiff, linesDiff) {
      if (this.movedEvents.indexOf(displayEvent.event._id)!=-1) return;
      this.movedEvents.push(displayEvent.event._id);
      let event = this.$store.getters["timeline/getEventById"](
        displayEvent.event._id
      );
      let date_start = DateTime.fromISO(displayEvent.event.date_start)
        .plus({ days: cellsDiff })
        .toISODate();
      let line = Math.max(0,displayEvent.line + linesDiff);
      if(linesDiff!=0) {
        for (let i in displayEvent.displayGroup.events) {
          if (displayEvent.displayGroup.events[i].event._id == event._id) {
            displayEvent.displayGroup.events[i].line = line
          }
        }
        if (line > displayEvent.displayGroup.group.lines-1) {
          displayEvent.displayGroup.group.lines++;
        } 
        displayEvent.line = line
        event.line = line;
        this.$forceUpdate();
      }
      if (cellsDiff!=0) {
        event.date_start = date_start;
        displayEvent.startcellnum = displayEvent.startcellnum + cellsDiff;
        this.$forceUpdate();
        if (this.timeline.selectedEventId == displayEvent.event._id) {
          this.$store.dispatch("selectEventAction", {
            eventId: this.selectedLocalEvent.event._id,
            repeatNum: this.selectedLocalEvent.repeatNum
          });
        }
      }
      for (let i=0;i<displayEvent.connections.length;i++) {
        this.moveEvent(displayEvent.connections[i], cellsDiff, 0);
      }
      this.movedEvents = []
    },
    handleEventDrag:_.throttle(function(e, displayEvent) {
      if (!e.clientX) return;
      let pointerCellsDiff = Math.round(
        (e.clientX - this.dragStart.x) / this.cellWidth
      );
      let newstartcellnum = this.dragStart.startcellnum + pointerCellsDiff
      let cellsDiff = newstartcellnum - displayEvent.startcellnum;
      let pointerLinesDiff = Math.round(
        (e.clientY - this.dragStart.y) / this.lineHeight
      );
      let linesDiff = this.dragStart.line + pointerLinesDiff - displayEvent.line;
      this.moveEvent(displayEvent,cellsDiff,linesDiff);
    },10),
    updateEventOnMoveEnd(displayEvent) {
      if (this.updatedMovedEvents.indexOf(displayEvent.event._id)!=-1) return;
      this.updatedMovedEvents.push(displayEvent.event._id);
      this.$store.dispatch("timeline/updateEventAction", {
        eventId: displayEvent.event._id,
        changes: {
          date_start: displayEvent.event.date_start,
          line: displayEvent.event.line
        },
      });
      for (let i=0;i<displayEvent.connections.length;i++) {
        this.updateEventOnMoveEnd(displayEvent.connections[i]);
      }
      this.updatedMovedEvents = [];
    },
    handleEventDragEnd(e, displayEvent) {
      this.updateEventOnMoveEnd(displayEvent)
    },
  },
};
</script>
