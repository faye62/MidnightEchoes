import { createApp } from 'vue';
// @ts-ignore
import App from '@/App.vue';
import '@/styles/var.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import _ from 'lodash';

const app = createApp(App);

app.config.globalProperties.$_ = _;
app.
use(ElementPlus)
  .mount('#app');


