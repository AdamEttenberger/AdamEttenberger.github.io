export interface IProjectInfo {
  title: String;
  icon: String;
  date: Date;
  lastmod?: Date;
};

export interface IProjectRoute {
  subpath: String;
};

export interface IProjectArticleImporter {
  article: Function;
};

export interface IProjectSummaryImporter {
  summary: Function;
};

export default class ProjectInfo implements IProjectInfo,
                                            IProjectRoute,
                                            IProjectArticleImporter,
                                            IProjectSummaryImporter {
  constructor(public subpath: String,
              public summary: Function,
              public article: Function,
              public title: String,
              public icon: String,
              public date: Date,
              public lastmod?: Date) {}
};
