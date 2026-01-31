import { createWebHashHistory, createRouter } from 'vue-router'
import { useScrollAffectingContentWaiterStore } from '@/stores/scroll_affecting_content_waiter'
import { ILicenseInfo } from '@/types/license_types'
import { IProjectInfo } from '@/types/project_types';
import LicensesList from '@/content/licenses_list'
import ProjectsList from '@/content/projects_list'

const routes = [
  {
    path: "/",
    component: () => import('@/views/projects.vue'),
    props: {
      projects: ProjectsList,
    },
  },
  {
    path: "/about/",
    component: () => import('@/views/about.vue'),
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
        props: item as ILicenseInfo,
      }))
    ],
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
        redirect: '/', // TODO: Implement standalone landing page.
      },
      ...ProjectsList.map(item => ({
        path: item.subpath,
        component: item.article,
        props: item as IProjectInfo,
      }))
    ],
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