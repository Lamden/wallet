import Vue from 'vue';
import ElementUI from 'element-ui';
import elementLocale from 'element-ui/lib/locale/lang/en';
import 'element-ui/lib/theme-chalk/index.css';
import VueClipboard from 'vue-clipboard2';
import root from './root';

Vue.config.devtools = true
Vue.config.productionTip = false;
Vue.use(ElementUI, { locale: elementLocale });
Vue.use(VueClipboard);
/* eslint-disable no-new */
new Vue({
  el: '#root',
  render: h => h(root),
});
