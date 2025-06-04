import { createMemoryHistory, createRouter } from 'vue-router'

import ProjectList from '/src/views/project/index.vue'
import match_three from '/src/views/project/match_three.vue'
import renu from '/src/views/project/renu.vue'
import webgl_metaballs from '/src/views/project/webgl_metaballs.vue'
import webgl_flocking from '/src/views/project/webgl_flocking.vue'
import webgl_example from '/src/views/project/webgl_example.vue'
import { createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: "/",
    component: ProjectList,
  },
  {
    path: "/project/",
    component: ProjectList,
  },
  {
    path: "/project/match_three/",
    component: match_three,
    props: {
      title: "Match-3 Game",
      date: new Date('2025/05/27'),
      lastmod: new Date('2025/06/04'),
      frame: "/library/projects/tile_match/tile_match.html",
    },
  },
  {
    path: "/project/renu/",
    component: renu,
    props: {
      title: "RENU - Imagine Cup 2013",
      date: new Date('2012/12/01'),
      lastmod: new Date('2012/12/01'),
      frame: "/library/projects/renu/main.html",
    },
  },
  {
    path: "/project/webgl_metaballs/",
    component: webgl_metaballs,
    props: {
      title: "WebGL Metaballs",
      date: new Date('2012/10/08'),
      lastmod: new Date('2012/10/08'),
      frame: "/library/projects/metaballs/main.html",
    },
  },
  {
    path: "/project/webgl_flocking/",
    component: webgl_flocking,
    props: {
      title: "WebGL Flocking",
      date: new Date('2012/10/05'),
      lastmod: new Date('2012/10/05'),
      frame: "/library/projects/flocking/main.html",
    },
  },
  {
    path: "/project/webgl_example/",
    component: webgl_example,
    props: {
      title: "WebGL Example",
      date: new Date('2012/09/01'),
      lastmod: new Date('2012/09/01'),
      frame: "/library/projects/webgl/main.html",
    },
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
export default router