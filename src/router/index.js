import { createMemoryHistory, createRouter } from 'vue-router'

import ProjectList from '/src/views/projects.vue'
import match_three from '/src/views/projects/match_three.vue'
import renu from '/src/views/projects/renu.vue'
import webgl_metaballs from '/src/views/projects/webgl_metaballs.vue'
import webgl_flocking from '/src/views/projects/webgl_flocking.vue'
import webgl_example from '/src/views/projects/webgl_example.vue'
import website from '/src/views/projects/website.vue'
import { createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: "/",
    component: ProjectList,
  },
  {
    path: "/projects/",
    component: ProjectList,
  },
  {
    path: "/projects/match_three/",
    component: match_three,
    props: {
      title: "Match-3 Game",
      date: new Date('2025/05/27'),
      lastmod: new Date('2025/06/04'),
      frame: "/library/projects/tile_match/tile_match.html",
    },
  },
  {
    path: "/projects/renu/",
    component: renu,
    props: {
      title: "RENU - Imagine Cup 2013 @ RIT",
      date: new Date('2012/12/01'),
      lastmod: new Date('2012/12/01'),
      frame: "/library/projects/renu/main.html",
    },
  },
  {
    path: "/projects/webgl_example/",
    component: webgl_example,
    props: {
      title: "WebGL Example",
      date: new Date('2012/09/01'),
      lastmod: new Date('2012/09/01'),
      frame: "/library/projects/webgl/main.html",
    },
  },
  {
    path: "/projects/webgl_flocking/",
    component: webgl_flocking,
    props: {
      title: "WebGL Flocking",
      date: new Date('2012/10/05'),
      lastmod: new Date('2012/10/05'),
      frame: "/library/projects/flocking/main.html",
    },
  },
  {
    path: "/projects/webgl_metaballs/",
    component: webgl_metaballs,
    props: {
      title: "WebGL Metaballs",
      date: new Date('2012/10/08'),
      lastmod: new Date('2012/10/08'),
      frame: "/library/projects/metaballs/main.html",
    },
  },
  {
    path: "/projects/website/",
    component: website,
    props: {
      title: "This Website",
    },
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
export default router