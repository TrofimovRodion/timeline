<template>
  <v-card flat v-if="editEvent">
    <v-card-title> Edit event </v-card-title>

    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <v-text-field label="Title" required autofocus :value="editEvent.title" ref="ref_editEventTitle"
            @input="handleInputTitle"></v-text-field>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="9">
          <v-menu v-model="startDatePicker" :close-on-content-click="false" :nudge-right="40"
            transition="scale-transition" offset-y min-width="auto" left>
            <template v-slot:activator="{ on, attrs }">
              <v-text-field :value="editEvent.date_start" label="Start Date" prepend-icon="mdi-calendar" readonly
                v-bind="attrs" v-on="on" @input="
                  $store.dispatch('timeline/updateEventAction', {
                    eventId: editEvent._id,
                    changes: { date_start: $event },
                  })
                "></v-text-field>
            </template>
            <v-date-picker :value="editEvent.date_start" @input="
              $store.dispatch('timeline/updateEventAction', {
                eventId: editEvent._id,
                changes: { date_start: $event },
              });
            startDatePicker = false;
            "></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="3">
          <v-text-field label="Duration" required :value="editEvent.duration" @input="handleInputDuration"
            type="number"></v-text-field>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>
          <v-select 
           :items="groups"
           :value = "editEvent.groupId"
           @change = "changeGroup($event)"
           label="Group" dense></v-select>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col>
          <v-switch dense label="Repeatable" required v-model="local.repeatable" @change="handleRepeatableSwitch">
          </v-switch>
        </v-col>
        <v-col v-if="local.repeatable">
          <v-switch dense label="Forever" required v-model="local.forever" @change="handleForeverSwitch">
          </v-switch>
        </v-col>
      </v-row>
      <v-row dense v-if="local.repeatable">
        <v-col>
          <v-text-field label="Period (days)" required :value="editEvent.period" @input="handleInputPeriod" type="number">
          </v-text-field>
        </v-col>
        <v-col>
          <v-menu v-if="!local.forever" v-model="repeatableEndDatePicker" :close-on-content-click="false"
            transition="scale-transition" offset-y min-width="auto"
            left>
            <template v-slot:activator="{ on, attrs }">
              <v-text-field :value="editEvent.date_repeatable_end" label="End Date" prepend-icon="mdi-calendar" readonly
                v-bind="attrs" v-on="on" @input="
                  $store.dispatch('timeline/updateEventAction', {
                    eventId: editEvent._id,
                    changes: { date_repeatable_end: $event },
                  })
                "></v-text-field>
            </template>
            <v-date-picker :value="editEvent.date_start" @input="
              $store.dispatch('timeline/updateEventAction', {
                eventId: editEvent._id,
                changes: { date_repeatable_end: $event },
              });
            repeatableEndDatePicker = false;
            "></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>

      <v-row dense align="center">
        <v-col>
          <v-text-field v-model="customColor" :mask="mask" return-masked-value hide-details class="ma-0 pa-0" solo>
            <template v-slot:append>
              <v-menu v-model="startColorPicker" top nudge-bottom="105" nudge-left="16" :close-on-content-click="false">
                <template v-slot:activator="{ on }">
                  <div :style="swatchStyle" v-on="on" />
                </template>
                <v-card>
                  <v-card-text class="pa-0">
                    <v-color-picker v-model="customColor" flat />
                  </v-card-text>
                </v-card>
              </v-menu>
            </template>
          </v-text-field>
        </v-col>
        <v-col v-if="editEvent.color" class="col-2">
          <v-btn icon @click="dropColor"><v-icon>mdi-close</v-icon></v-btn>
        </v-col>
      </v-row>

    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn color="primary" text @click="remove()"> Remove </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import _ from "lodash";
import { mapState } from 'vuex';

export default {
  props: {
    display: {
      type: Boolean,
      default: false,
    },
    editEventId: {
      type: String,
    },
  },
  data() {
    return {
      innerDisplay: false,
      startDatePicker: false,
      repeatableEndDatePicker: false,
      color: "#1976D2",
      mask: "!#XXXXXX",
      startColorPicker: false,
      customColor: null,
      local: {
        repeatable: false,
        forever: true
      }
    };
  },
  computed: {
    groups() {
      return this.$store.getters["timeline/getAllGroups"]().map(group=>{ return {text:group.title,value:group._id}})
    },
    editEvent() {
      let event = this.$store.getters["timeline/getEventById"](this.timeline.selectedEventId);
      return event
    },
    swatchStyle() {
      const { customColor, startColorPicker } = this;
      return {
        backgroundColor: customColor,
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: startColorPicker ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out",
      };
    },
    ...mapState(['timeline'])
  },
  watch: {
    editEventId: function () {
      this.$refs.ref_editEventTitle.focus();
      if (this.editEvent) {
        let group = this.$store.getters["timeline/getGroupById"](this.editEvent.groupId);
        this.customColor = this.editEvent.color?this.editEvent.color:group.background
      }
    },
    ["editEvent.period"]: function () {
      this.local.repeatable = parseInt(this.editEvent.period) > 0 ? true : false;
    },
    ["editEvent.date_repeatable_end"]: function () {
      this.local.forever = this.editEvent.date_repeatable_end ? false : true;
    },
    customColor: function (newVal) {
      if (!this.editEvent) return;
      if (this.editEvent.color!= newVal) {
        let group = this.$store.getters["timeline/getGroupById"](this.editEvent.groupId);
        if (group.background==newVal) {
          newVal = null;
        }
        this.editEvent.color = newVal;
        this.$store.dispatch("timeline/updateEventAction", {
          eventId: this.editEventId,
          changes: { color: newVal }
        })
      }
    },
    display: function (newVal) {
      this.innerDisplay = newVal;
    },
    innerDisplay: function (newVal) {
      if (!newVal) this.close();
    },
  },
  mounted () {
    this.startDatePicker = false
    this.repeatableEndDatePicker = false
    this.local.repeatable = parseInt(this.editEvent.period) > 0 ? true : false;
    this.local.forever = this.editEvent.date_repeatable_end ? false : true;
    this.customColor = null
    if (this.editEvent) {
      let group = this.$store.getters["timeline/getGroupById"](this.editEvent.groupId);
      this.customColor = this.editEvent.color?this.editEvent.color:group.background
    }
  },
  methods: {
    async changeGroup(groupId) {
      this.$store.dispatch("timeline/moveEventToGroupAction", {
        eventId: this.editEventId,
        newGroupId: groupId
      })
      
    },
    dropColor() {
        this.editEvent.color = null;
        let group = this.$store.getters["timeline/getGroupById"](this.editEvent.groupId);
        this.customColor = group.background
        this.$store.dispatch("timeline/updateEventAction", {
          eventId: this.editEventId,
          changes: { color: null }
        })
    },
    remove() {
      this.$store.dispatch("timeline/removeEventAction", this.editEventId);
    },
    close() {
      this.$emit("close");
    },
    handleInputTitle: _.debounce(function (newTitle) {
      this.$store.dispatch("timeline/updateEventAction", {
        eventId: this.editEventId,
        changes: { title: newTitle },
      });
    }, 300),
    handleInputDuration: _.debounce(function (newDuration) {
      this.$store.dispatch("timeline/updateEventAction", {
        eventId: this.editEventId,
        changes: { duration: newDuration },
      });
    }, 300),
    handleInputPeriod: _.debounce(function (newPeriod) {
      this.$store.dispatch("timeline/updateEventAction", {
        eventId: this.editEventId,
        changes: { period: newPeriod },
      });
    }, 300),
    handleRepeatableSwitch: _.debounce(function(val) {
      let period = val ? (parseInt(this.editEvent.duration)+1) : 0;
      this.$store.dispatch("timeline/updateEventAction", {
        eventId: this.editEventId,
        changes: { period: period }
      })
    },300),
    handleForeverSwitch: _.debounce(function() {
      this.$store.dispatch("timeline/updateEventAction", {
        eventId: this.editEventId,
        changes: { date_repeatable_end: null }
      })
    },300)
  },
};
</script>
