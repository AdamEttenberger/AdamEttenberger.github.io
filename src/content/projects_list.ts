import { type IProjectInfo } from '@/types/project_types'

export default <IProjectInfo[]>[
  {
    article: () => import('@/content/projects/webgpu_ocean/article.vue'),
    subpath: 'webgpu_ocean',
    title: 'WebGPU BRDF Ocean Scene',
    thumbnail: {
      srcDark: '/images/projects/webgpu_ocean/icon_dark.png',
      srcLight: '/images/projects/webgpu_ocean/icon_light.png',
    },
    date: new Date('2026/09/03'),
    lastmod: new Date('2026/09/11'),
  },
  {
    article: () => import('@/content/projects/heart_sdf/article.vue'),
    subpath: 'heart_sdf',
    title: 'Anatomy of a Heart (SDF)',
    thumbnail: '/images/projects/sdf/icon.png',
    date: new Date('2026/01/29'),
    lastmod: new Date('2026/01/31'),
  },
  {
    article: () => import('@/content/projects/match_three/article.vue'),
    subpath: 'match_three',
    title: 'Match-3 Game',
    thumbnail: '/images/projects/match_three/icon.png',
    date: new Date('2025/05/27'),
    lastmod: new Date('2026/03/16'),
  },
  {
    article: () => import('@/content/projects/renu/article.vue'),
    subpath: 'renu',
    title: 'RENU - Imagine Cup 2013 @ RIT',
    thumbnail: '/images/projects/renu/icon.png',
    date: new Date('2012/12/01'),
    lastmod: new Date('2012/12/01'),
  },
  {
    article: () => import('@/content/projects/metaballs/article.vue'),
    subpath: 'metaballs',
    title: 'WebGL Metaballs',
    thumbnail: '/images/projects/metaballs/icon.png',
    date: new Date('2012/10/08'),
    lastmod: new Date('2025/06/18'),
  },
  {
    article: () => import('@/content/projects/flocking/article.vue'),
    subpath: 'flocking',
    title: 'WebGL Flocking',
    thumbnail: '/images/projects/flocking/icon.png',
    date: new Date('2012/10/05'),
    lastmod: new Date('2025/07/07'),
  },
  {
    article: () => import('@/content/projects/proto_engine/article.vue'),
    subpath: 'proto_engine',
    title: 'WebGL Proto-Engine',
    thumbnail: '/images/projects/proto_engine/icon.png',
    date: new Date('2012/09/01'),
    lastmod: new Date('2025/06/25'),
  },
];
