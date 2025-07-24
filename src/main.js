import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import { library } from '@fortawesome/fontawesome-svg-core'
// import { fas } from '@fortawesome/free-solid-svg-icons'
// import { far } from '@fortawesome/free-regular-svg-icons'
// import { fab } from '@fortawesome/free-brands-svg-icons'
import {
  faCirclePlay,
  faDragon,
  faEnvelope,
  faFileCircleXmark,
  faFilePdf,
  faGear,
  faLightbulb,
  faQuestion,
  faRotateLeft,
  faUpRightFromSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import {
  faGithub,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

// FontAwesome Config
library.add(
  faCirclePlay,
  faDragon,
  faEnvelope,
  faFileCircleXmark,
  faFilePdf,
  faGear,
  faLightbulb,
  faQuestion,
  faRotateLeft,
  faUpRightFromSquare,
  faXmark,
);
library.add(
  faGithub,
  faLinkedinIn,
);
app.component('font-awesome-icon', FontAwesomeIcon);
// Routing Config
app.use(router);
app.mount('#app');
