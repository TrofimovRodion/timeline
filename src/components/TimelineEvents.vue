<style scoped>
.groups {
    position:relative;
}
.group {
    position:absolute;
    border-bottom:1px solid #fff;
    width:100%;
}
.groupEvents {
    position:relative;
    margin:5px 0;
}
.event {
  position: absolute;
  height: 29px;
  border-radius: 3px;
  overflow:hidden;
  display: flex;
  cursor:pointer;
  align-items: center;
  border:1px solid #ffffff00;
  box-shadow: 0px 1px 4px #00000055;
}
.event.selected {
    border:1px solid #fff;
}
.eventTitle {
  text-overflow: ellipsis;
  width:100%;
  margin:2px 4px;
  font-size:0.8em;
}
</style>
<template>
  <div class="groups">
    <div
      class="group"
      v-for="group in display.groups"
      :key="group._id"
      :style="getGroupStyle(group)"
    >
      <div class="groupEvents">
        <div
            v-for="event in group.events"
            :key="event.key"
            :class="`event`+((selectedEventKey==event.key)?` selected`:``)"
            :style="getEventStyle(event)"
            @click="selectEvent(event)"
            draggable="true"
        >
            <div class="eventTitle">{{ event.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";


export default {
    data:function () {
        return {
            selectedEventKey:-1
        }
    },
  computed: {
    display() {
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
    ...mapState(["timeline", "fromDate", "toDate", "lineHeight", "cellWidth"]),
  },
  methods: {
    getGroupStyle(group) {
      let style = "";
      style += "top:" + group.top * this.lineHeight+"px;";
      style += "height:" + group.height * this.lineHeight+"px;";
      return style;
    },
    getEventStyle(event) {
      let style = "";
      style += "background:" + event.group.background + ";";
      style += "color:" + event.group.foreground + ";";
      style += "left:" + event.startdaynum * this.cellWidth + "px;";
      style += "top:" + event.line * this.lineHeight + "px;";
      style += "width:" + event.duration * this.cellWidth + "px;";
      return style;
    },
    selectEvent(event) {
        this.timeline.selectedEventId = event._id
        this.selectedEventKey = event.key
    }
  },
};
</script>
