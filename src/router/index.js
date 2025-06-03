import { createMemoryHistory, createRouter } from 'vue-router'

import Home from '/src/views/Home.vue'
import match_three from '/src/views/project/match_three.vue'
import renu from '/src/views/project/renu.vue'
import webgl_metaballs from '/src/views/project/webgl_metaballs.vue'
import webgl_flocking from '/src/views/project/webgl_flocking.vue'
import webgl_example from '/src/views/project/webgl_example.vue'
import { createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/project/match_three",
    component: match_three,
  },
  {
    path: "/project/renu",
    component: renu,
  },
  {
    path: "/project/webgl_metaballs",
    component: webgl_metaballs,
  },
  {
    path: "/project/webgl_flocking",
    component: webgl_flocking,
  },
  {
    path: "/project/webgl_example",
    component: webgl_example,
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
export default router