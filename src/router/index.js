import { createMemoryHistory, createRouter } from 'vue-router'

import Home from '/src/views/Home.vue'
import { createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: "/",
    name: 'Home',
    component: Home,
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
export default router