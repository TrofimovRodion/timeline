<template>
  <v-card flat v-if="editEvent">
    <v-card-title> Edit event </v-card-title>

    <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              label="Title"
              required
              autofocus
              :value="editEvent.title"
              @input="handleInputTitle"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              label="Duration"
              required
              :value="editEvent.duration"
              @input="handleInputDuration"
              type="number"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              label="Period"
              required
              :value="editEvent.period"
              @input="handleInputPeriod"
              type="number"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-menu
              v-model="startDatePicker"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="editEvent.date_start"
                  label="Start Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  @input="
                    $store.dispatch('timeline/updateEventAction', {
                      event: editEvent,
                      changes: { date_start: $event },
                    })
                  "
                ></v-text-field>
              </template>
              <v-date-picker
                :value="editEvent.date_start"
                @input="
                  $store.dispatch('timeline/updateEventAction', {
                    event: editEvent,
                    changes: { date_start: $event },
                  });
                  startDatePicker = false;
                "
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="editEvent.color"
              :mask="mask"
              return-masked-value
              hide-details
              class="ma-0 pa-0"
              solo
            >
              <template v-slot:append>
                <v-menu
                  v-model="startColorPicker"
                  top
                  nudge-bottom="105"
                  nudge-left="16"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on }">
                    <div :style="swatchStyle" v-on="on" />
                  </template>
                  <v-card>
                    <v-card-text class="pa-0">
                      <v-color-picker v-model="color" flat />
                    </v-card-text>
                  </v-card>
                </v-menu>
              </template>
            </v-text-field>
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
      color: "#1976D2FF",
      mask: "!#XXXXXXXX",
      startColorPicker: false,
    };
  },
  computed: {
    editEvent() {
      return this.$store.getters["timeline/getEventById"](this.timeline.selectedEventId);
    },
    swatchStyle() {
      const { color, startColorPicker } = this;
      return {
        backgroundColor: color,
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
    display: function (newVal) {
      this.innerDisplay = newVal;
    },
    innerDisplay: function (newVal) {
      if (!newVal) this.close();
    },
  },
  methods: {
    remove() {
      this.$store.dispatch("timeline/removeEventAction", this.editEvent);
    },
    close() {
      this.$emit("close");
    },
    handleInputTitle: _.debounce(function (newTitle) {
      this.$store.dispatch("timeline/updateEventAction", {
        event: this.editEvent,
        changes: { title: newTitle },
      });
    }, 300),
    handleInputDuration: _.debounce(function (newDuration) {
      this.$store.dispatch("timeline/updateEventAction", {
        event: this.editEvent,
        changes: { duration: newDuration },
      });
    }, 300),
    handleInputPeriod: _.debounce(function (newPeriod) {
      this.$store.dispatch("timeline/updateEventAction", {
        event: this.editEvent,
        changes: { period: newPeriod },
      });
    }, 300),
  },
};
</script>
