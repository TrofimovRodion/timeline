<style scoped>
.months {
    display: flex;
    width:max-content;
}
.month {
    min-width:24px;
    height:24px;
    margin:0 1px 1px 0;
    background:#4C576D;
    color:#fff;
    font-weight: bold;
    font-size:0.8em;
    text-align:center;
    line-height:25px;
    overflow:hidden;
    text-overflow: ellipsis;
}
.cells {
    display: flex;
    width:max-content;
    background:#fff;
}
.cell {
    min-width:24px;
    height:24px;
    margin:0 1px 1px 0;
    color: #868282;
    background:#F6F6F6;
    font-size:0.8em;
    text-align:center;
    line-height:25px;
    overflow:hidden;
    text-overflow: ellipsis;
}
.cell.highlight {
  background:#D8E0EF;
}
.cell.weekend {
  background:#FFE8C6;
}
.cell.weekend.highlight {
  background:#F6CC8D;
}
.calendar {
  width:max-content;
  background:#fff;
  box-shadow:0px 2px 5px #00000055
}
</style>
<template>
    <div class="calendar">
        <div class="months">
            <div v-for="month in display.months" :key="month.date" class="month" :style="`min-width:`+(month.width*cellWidth-1)+`px; width:`+(month.width*cellWidth-1)+`px`">
                {{month.month}}
            </div>
        </div>
        <div class="cells">
            <div v-for="cell in display.cells" :key="cell.date" :class="`cell`+(cell.highlight?` highlight`:``)+(cell.isWeekend?` weekend`:``)" :style="`min-width:`+cell.width+`px; width:`+cell.width+`px`">
                {{cell.title}}
            </div>
        </div>
    </div>
</template>
<script>
import { DateTime } from "luxon";
import { mapState } from "vuex";
//import { DateTime } from "luxon";

const c_MonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

//const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

export default {
  computed: {
    display: function () {
      let fromDate = DateTime.fromISO(this.fromDate)
      let toDate = DateTime.fromISO(this.toDate);

      const diffDays = toDate.diff(fromDate, 'days').as('days')+1
      let cells = [];
      let months = [];
      let curMonth = -1;
      let totalWidth = 0;
      let curDate = fromDate;
      let scale = this.cellWidth > 15 ? 1 : 7;
      for (let i = 0; i < diffDays; i+=1) {
        let highlight = false
        if (scale == 1) {
          if (this.highlightedDays && this.highlightedDays.start <= curDate && curDate < this.highlightedDays.end) {
            highlight = true;
          }
          cells.push({
            isWeekend: curDate.weekday == 6 || curDate.weekday == 7,
            title: curDate.day,
            date: curDate.toISODate(),
            highlight: highlight,
            width:this.cellWidth-1
          });
        } else {
          if (this.highlightedDays && this.highlightedDays.start <= curDate.plus({days:7-curDate.weekday}) && curDate < this.highlightedDays.end) {
            highlight = true;
          }
          if (i==0||curDate.weekday==1) {
            cells.push({
              isWeekend: curDate.weekday == 6 || curDate.weekday == 7,
              title: curDate.day+" - "+(curDate.plus({days:7-curDate.weekday}).day),
              date: curDate.toISODate(),
              highlight: highlight,
              width:this.cellWidth*(7-curDate.weekday+1)-1
            });
          }
        }
        if (curMonth != curDate.month) {
          let width = 0;
          width = (curMonth!=-1 ? curDate.daysInMonth : (DateTime.local(curDate.year,curDate.month,1).plus({month:1}).diff(curDate,'days').as('days')));
          curMonth = curDate.month;
          months.push({
            width: width,
            left: totalWidth,
            month: c_MonthNames[curMonth-1],
          });
          totalWidth += width;
        }
        curDate = curDate.plus({days:1})
      }
      return {
        cells:cells,
        months: months,
        maxX: this.cellWidth * cells.length
      }
    },
    ...mapState(["timeline","fromDate", "toDate", "lineHeight", "cellWidth", "highlightedDays"]),
  },
};
</script>