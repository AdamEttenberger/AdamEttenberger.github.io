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
  faArrowRotateLeft,
  faFileCircleXmark,
  faCirclePlay,
  faDragon,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import {
  faGithubSquare,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

// FontAwesome Config
library.add(
  faArrowRotateLeft,
  faFileCircleXmark,
  faCirclePlay,
  faDragon,
  faUpRightFromSquare,
);
library.add(
  faLinkedin,
  faGithubSquare
);
app.component('font-awesome-icon', FontAwesomeIcon);
// Routing Config
app.use(router);
app.mount('#app');
