<template>
    <v-card flat>
      <v-card-title> Edit group </v-card-title>

      <v-card-text>
          <v-row dense>
            <v-col>
              <v-text-field
                label="Title"
                required
                autofocus
                :value="editGroup.title"
                @input="handleInputTitle"
              ></v-text-field>
            </v-col>
          </v-row>          
          <v-row dense>
            <v-col>
              <v-text-field v-model="editGroup.background" :mask="mask" return-masked-value hide-details class="ma-0 pa-0" solo>
                <template v-slot:append>
                  <v-menu v-model="startColorPicker" top nudge-bottom="105" nudge-left="16" :close-on-content-click="false">
                    <template v-slot:activator="{ on }">
                      <div :style="swatchStyle" v-on="on" />
                    </template>
                    <v-card>
                      <v-card-text class="pa-0">
                        <v-color-picker v-model="editGroup.background" @input="handleColorChange" flat />
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
import _ from 'lodash'

export default {
  props: {
    display: {
      type: Boolean,
      default: false,
    },
    editGroupId: {
      type: String,
    },
  },
  data() {
    return {
      innerDisplay: false,
      color: '#1976D2FF',
      mask: '!#XXXXXXXX',
      startColorPicker: false,
    };
  },
  computed: {
    editGroup() {
      return this.$store.getters["timeline/getGroupById"](this.editGroupId);
    },
    swatchStyle() {
      //const { color, startColorPicker } = this
      return {
        backgroundColor: this.editGroup.background,
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderRadius: this.startColorPicker ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out'
      }
    }
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
      this.$store.dispatch("timeline/removeGroupAction", this.editGroupId);
    },
    close() {
      this.$emit("close");
    },
    handleInputTitle: _.debounce(function (newTitle) {
      this.$store.dispatch('timeline/updateGroupAction', {
                    groupId: this.editGroupId,
                    changes: { title: newTitle },
                  })
    }, 300),
    handleColorChange: _.debounce(function (newColor) {
      this.$store.dispatch('timeline/updateGroupAction', {
                    groupId: this.editGroupId,
                    changes: { background: newColor },
                  })
    }, 300)
  },
};
</script>
