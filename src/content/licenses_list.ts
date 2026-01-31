import LicenseInfo from '@/types/license_types';

export default [
  new LicenseInfo('createjs-1.0.1',
                  'CreateJS',
                  'CreateJS',
                  new Date('2018/01/24'),
                  () => fetch('/third_party/createjs-1.0.1/LICENSE?raw')),
  new LicenseInfo('font-awesome-3.1.3',
                  'Font Awesome',
                  'Fonticons, Inc',
                  new Date('2026/01/07'),
                  () => import('@/assets/licenses/font-awesome-3.1.3/LICENSE?raw')),
  new LicenseInfo('gl-matrix-3.4.1',
                  'glMatrix',
                  'Brandon Jones, Colin MacKenzie IV.',
                  new Date('2021/10/05'),
                  () => fetch('/third_party/gl-matrix-3.4.1/LICENSE?raw')),
  new LicenseInfo('stixfonts-2.13b171',
                  'SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007',
                  'The STIX Fonts Project Authors',
                  new Date('2021/05/26'),
                  () => import('@/assets/fonts/stixfonts-2.13b171/LICENSE?raw')),
];
