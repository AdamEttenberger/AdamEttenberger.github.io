import { createWebHistory, createRouter } from 'vue-router'
import { useScrollAffectingContentWaiterStore } from '@/stores/scroll_affecting_content_waiter'
import userPrefsStore from '@/stores/local_storage/user_prefs'
import Plausible from 'plausible-tracker'

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
    path: "/privacy_statement/",
    component: () => import('@/views/privacy_statement.vue'),
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
  history: createWebHistory(),
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

router.afterEach(() => {
  const user_prefs = userPrefsStore();
  if (!user_prefs.allowFirstPartyTracking) {
    return;
  }
  // const plausible = Plausible({
  //   apiHost: 'https://127.0.0.1',
  //   domain: 'adamettenberger.com',
  //   hashMode: true, // Enables tracking based on URL hash changes.
  //   trackLocalhost: false,
  // });
  // plausible.trackPageview();
});

export default router;