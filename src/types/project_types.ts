import { ThemeColor } from '@/composables/theme';

export interface IProjectInfo {
  subpath: String;
  title: String;
  icon: String;
  date: Date;
  lastmod?: Date;
  color?: ThemeColor;
};

export interface IProjectArticleImporter {
  article: Function;
};

export default class ProjectInfo implements IProjectInfo,
                                            IProjectArticleImporter {
  constructor(public subpath: String,
              public article: Function,
              public title: String,
              public icon: String,
              public date: Date,
              public lastmod?: Date,
              public color?: ThemeColor) {}
};
