import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import {io} from "socket.io-client";
import VueSocketIO from "vue-socket.io";

Vue.config.productionTip = false

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: io('http://localhost:3000',{
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd"
      },
      
    }),
    vuex: {
      store,
      actionPrefix: "SOCKET_",
      mutationPrefix: "SOCKET_"
    }
  })
);

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
