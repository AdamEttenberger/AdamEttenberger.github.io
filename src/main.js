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
  faCircleExclamation,
  faCircleInfo,
  faCirclePlay,
  faCompass,
  faDragon,
  faEnvelope,
  faFileCircleXmark,
  faGear,
  faHouse,
  faLightbulb,
  faPalette,
  faRoadBarrier,
  faTrash,
  faTriangleExclamation,
  faUpRightFromSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import {
  faGithub,
  faLinkedinIn,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

// FontAwesome Config
library.add(
  faCircleExclamation,
  faCircleInfo,
  faCirclePlay,
  faCompass,
  faDragon,
  faEnvelope,
  faFileCircleXmark,
  faGear,
  faHouse,
  faLightbulb,
  faPalette,
  faRoadBarrier,
  faTrash,
  faTriangleExclamation,
  faUpRightFromSquare,
  faXmark,
);
library.add(
  faGithub,
  faLinkedinIn,
  faYoutube,
);
app.component('font-awesome-icon', FontAwesomeIcon);
// Routing Config
app.use(router);
app.mount('#app');
