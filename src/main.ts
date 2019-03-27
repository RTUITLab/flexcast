import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

import Icon from 'vue-awesome/components/Icon';
Vue.component('v-icon', Icon);

import state from '@/model/State';
import bus from '@/model/Bus';

Vue.prototype.$state = state;
Vue.prototype.$bus = bus;

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app');
