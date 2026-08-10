import { createWebHashHistory, createRouter } from 'vue-router'
import LicensesList from '@/content/licenses_list'
import ProjectsList from '@/content/projects_list'
import useResizeObserver from '@/composables/resize_observer';
import { debounce } from '@/util/rate_limit';
import { ref } from 'vue';

/**
 * Wait until the root container size has been idle
 * for at least `WAIT_FOR_LAYOUT_TIMEOUT` before
 * allowing scroll to be restored. If the overall
 * duration exceeds `WAIT_FOR_LAYOUT_TIMEOUT` abort.
 */
const WAIT_FOR_LAYOUT_DEBOUNCE = 300;
const WAIT_FOR_LAYOUT_TIMEOUT = 1000;

const routes = [
  {
    path: "/",
    component: () => import('@/views/home.vue'),
    props: {
      projects: ProjectsList,
    },
  },
  {
    path: "/licenses",
    children: [
      {
        path: '',
        component: () => import('@/views/licenses.vue'),
        props: {
          licenses: LicensesList,
        },
      },
      ...LicensesList.map(item => ({
        path: item.subpath,
        component: () => import('@/views/files/license_file.vue'),
        props: item,
      }))
    ],
  },
  {
    path: "/palette/",
    component: () => import('@/views/palette.vue'),
  },
  {
    path: "/privacy/",
    component: () => import('@/views/privacy.vue'),
  },
  {
    path: "/projects",
    children: [
      {
        path: '',
        redirect: '/', // TODO: Implement standalone projects page.
      },
      ...ProjectsList.map(item => ({
        path: item.subpath,
        component: item.article,
        props: item,
      }))
    ],
  },
  {
    path: "/settings/",
    component: () => import('@/views/settings.vue'),
  },
];

const controller = ref<AbortController>();

function waitForStableLayoutAsync() {
  return new Promise<void>((resolve, rejected) => {
    const timeout = setTimeout(rejected, WAIT_FOR_LAYOUT_TIMEOUT);
    const observer = useResizeObserver(debounce(() => {
      if (controller.value?.signal.aborted) {
        rejected();
        return;
      }
      clearTimeout(timeout);
      observer.stop();
      resolve();
    }, WAIT_FOR_LAYOUT_DEBOUNCE));
    observer.observe(document.documentElement);
  }).catch(() => {
    controller.value?.abort();
  });
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: async (to, _from, savedPosition) => {
    if (savedPosition) {
      await waitForStableLayoutAsync();
      return savedPosition;
    }

    if (to.hash) {
      await waitForStableLayoutAsync();
      return {
        el: to.hash,
        top: 0,
        behavior: 'smooth',
      };
    }

    return { top: 0 };
  },
});

router.beforeEach((_to, _from) => {
  controller.value?.abort();
  controller.value = new AbortController();
});

export default router;