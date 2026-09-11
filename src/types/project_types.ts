import { type RouteComponent } from 'vue-router'
import { type ThemeColor } from '@/composables/theme'
import { type DateLike } from '@/util/date'
import type { MaybeThemedImage } from '@/types/themed-image';

export interface IProjectInfo {
  article: RouteComponent;
  subpath: string;
  title: string;
  thumbnail: MaybeThemedImage;
  date: DateLike;
  lastmod?: DateLike;
  color?: ThemeColor;
};
