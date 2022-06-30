
<template>
  <div id="app" style="height:100%">
    <v-app id="vapp" style="height:100%">
      <router-view />
    </v-app>
  </div>
</template>

<script>
export default {
  sockets:{
    connect: function () {
      console.log('socket to notification channel connected')
    },
    disconnect: function () {
      console.log('disconnected')
    },
    reconnect: function () {
      console.log('reconnected')
    }
  },
  mounted() {
    this.$store.dispatch('setSocketIO',{io:this.$socket})
  }
}
</script>