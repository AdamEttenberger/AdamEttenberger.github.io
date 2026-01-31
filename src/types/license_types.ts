export interface ILicenseInfo {
  subpath: String;
  name: String;
  author: String;
  date: Date;
  file_import: Function;
};

export default class LicenseInfo implements ILicenseInfo {
  constructor(public subpath: String,
              public name: String,
              public author: String,
              public date: Date,
              public file_import: Function) {}
};
