<style scoped>
.calendar {
  position: sticky;
  top:0px;
  z-index: 1;
  width: max-content;
}
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
</style>
<template>
    <div class="calendar">
        <div class="months">
            <div v-for="month in display.months" :key="month.date" class="month" :style="`min-width:`+(month.width*cellWidth-1)+`px`">
                {{month.month}}
            </div>
        </div>
        <div class="cells">
            <div v-for="cell in display.cells" :key="cell.date" :class="`cell`+(cell.highlight?` highlight`:``)+(cell.isWeekend?` weekend`:``)" :style="`min-width:`+(cellWidth-1)+`px`">
                {{cell.title}}
            </div>
        </div>
    </div>
</template>
<script>
import { mapState } from "vuex";

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

const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

export default {
  computed: {
    display: function () {
      let fromDate = new Date(this.fromDate);
      let toDate = new Date(this.toDate);

      const diffDays = Math.round(Math.abs((toDate - fromDate) / oneDay)) + 1;
      let cells = [];
      let months = [];
      let curMonth = -1;
      let totalWidth = 0;
      for (let i = 0; i < diffDays; i++) {
        let highlight = false
        if (this.highlightedDays && this.highlightedDays.start <= fromDate && fromDate < this.highlightedDays.end) {
          highlight = true;
        }
        cells.push({
          isWeekend: fromDate.getDay() == 0 || fromDate.getDay() == 6,
          title: fromDate.getDate(),
          date: fromDate.toISOString(),
          highlight: highlight
        });
        if (curMonth != fromDate.getMonth()) {
          curMonth = fromDate.getMonth();
          let width = new Date(
            fromDate.getFullYear(),
            fromDate.getMonth() + 1,
            0
          ).getDate();
          months.push({
            width: width,
            left: totalWidth,
            month: c_MonthNames[curMonth],
          });
          totalWidth += width;
        }
        fromDate.setDate(fromDate.getDate() + 1);
      }
      return {
        cells:cells,
        months: months,
        maxX: this.cellWidth * cells.length
      }
    },
    ...mapState(["timeline","fromDate", "toDate", "lineHeight", "zoom", "cellWidth", "highlightedDays"]),
  },
};
</script>