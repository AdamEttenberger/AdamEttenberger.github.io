import { createWebHashHistory, createRouter } from 'vue-router'
import { useScrollAffectingContentWaiterStore } from '@/stores/scroll_affecting_content_waiter'

const routes = [
  {
    path: "/",
    component: () => import('@/views/projects.vue'),
  },
  {
    path: "/about/",
    component: () => import('@/views/about.vue'),
  },
  {
    path: "/privacy/",
    component: () => import('@/views/privacy.vue'),
  },
  {
    path: "/projects/",
    component: () => import('@/views/projects.vue'),
  },
  {
    path: "/projects/match_three/",
    component: () => import('@/views/projects/match_three.vue'),
    props: {
      title: "Match-3 Game",
      date: new Date('2025/05/27'),
      lastmod: new Date('2025/07/14'),
      frame: "/library/projects/tile_match/tile_match.html",
    },
  },
  {
    path: "/projects/renu/",
    component: () => import('@/views/projects/renu.vue'),
    props: {
      title: "RENU - Imagine Cup 2013 @ RIT",
      date: new Date('2012/12/01'),
      lastmod: new Date('2012/12/01'),
      frame: "/library/projects/renu/main.html",
    },
  },
  {
    path: "/projects/webgl_proto_engine/",
    component: () => import('@/views/projects/webgl_proto_engine.vue'),
    props: {
      title: "WebGL Proto-Engine",
      date: new Date('2012/09/01'),
      lastmod: new Date('2025/06/25'),
      frame: "/library/projects/proto_engine/main.html",
    },
  },
  {
    path: "/projects/webgl_flocking/",
    component: () => import('@/views/projects/webgl_flocking.vue'),
    props: {
      title: "WebGL Flocking",
      date: new Date('2012/10/05'),
      lastmod: new Date('2025/07/07'),
      frame: "/library/projects/flocking/main.html",
    },
  },
  {
    path: "/projects/webgl_metaballs/",
    component: () => import('@/views/projects/webgl_metaballs.vue'),
    props: {
      title: "WebGL Metaballs",
      date: new Date('2012/10/08'),
      lastmod: new Date('2025/06/18'),
      frame: "/library/projects/metaballs/main.html",
    },
  },
  {
    path: "/projects/website/",
    component: () => import('@/views/projects/website.vue'),
    props: {
      title: "This Website",
      date: new Date('2012/09/19'),
      lastmod: new Date(__BUILD_TIMESTAMP__),
    },
  },
  {
    path: "/settings/",
    component: () => import('@/views/settings.vue'),
  },
];

var router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (!savedPosition) {
      return { top: 0 };
    }
    const store = useScrollAffectingContentWaiterStore();
    document.querySelectorAll("iframe,img").forEach((ele) => {
      if (ele instanceof HTMLIFrameElement) {
        if (ele.src && ele.readyState === 'loading') {
          store.add(new Promise((resolve) => ele.addEventListener('load', resolve, { once: true})));
        }
      } else if (ele instanceof HTMLImageElement) {
        if (ele.src && !ele.complete) {
          store.add(new Promise((resolve) => ele.addEventListener('load', resolve, { once: true})));
        }
      }
    });
    return store.wait.then(() => savedPosition);
  },
});

export default router;