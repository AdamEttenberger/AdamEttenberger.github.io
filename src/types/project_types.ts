import { type RouteComponent } from 'vue-router'
import { type ThemeColor } from '@/composables/theme'
import { type DateLike } from '@/util/date'

export interface IProjectInfo {
  subpath: string;
  title: string;
  icon: string;
  date: DateLike;
  lastmod?: DateLike;
  color?: ThemeColor;
};

export default class ProjectInfo implements IProjectInfo {
  constructor(public subpath: string,
              public article: RouteComponent,
              public title: string,
              public icon: string,
              public date: DateLike,
              public lastmod?: DateLike,
              public color?: ThemeColor) {}
};
