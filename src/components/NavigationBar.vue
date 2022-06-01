<template>
    <div>
      <v-app-bar app
        elevation="1"
        flat
        outlined>
        <v-row align-content="space-between">
          <v-col>
            <v-btn plain @click="handleTimelinesClick">
              <v-icon left>mdi-arrow-left</v-icon>
              Timelines
            </v-btn>
          </v-col>
          <v-col align="center">
            <v-toolbar-title>{{timeline.timeline.title}}</v-toolbar-title>
          </v-col>
          <v-col align="right">
            <v-row justify="end" no-gutters>
              <v-col cols="4" align-self="center"><v-icon>mdi-account-eye</v-icon>Guest</v-col>
              <v-col cols="4"><v-btn plain @click="handleLoginClick">Log in</v-btn></v-col>
              <v-col cols="4"><v-btn color="primary" @click="handleSignupClick">Sign up</v-btn></v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-app-bar>
    </div>
</template>
<script>
import { mapState } from "vuex";

export default {
  name:'NavigationBar',
  computed:{
    ...mapState(["timeline", "fromDate", "toDate"]),
  },
  methods:{
    handleTimelinesClick() {
      this.$router.push('/list')
    },
    handleLoginClick() {

    },
    handleSignupClick() {

    }
  }
}
</script>
