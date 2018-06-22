import Vue from 'vue';
import ElementUI from 'element-ui';
import elementLocale from 'element-ui/lib/locale/lang/en';
import 'element-ui/lib/theme-chalk/index.css';
import root from './root';

Vue.config.productionTip = false;
Vue.use(ElementUI, { locale: elementLocale });
/* eslint-disable no-new */
new Vue({
  el: '#root',
  render: h => h(root),
});
