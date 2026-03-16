import { type MaybeRefOrGetter } from 'vue'
import { type AsyncDocumentLoader, type ITextDocumentParam, type TextDocumentSourceFunc } from '@/types/text_document'
import { type DateLike } from '@/util/date'

export interface ILicenseInfo extends ITextDocumentParam {
  subpath: string;
  name: string;
  author: string;
  date: DateLike;
};

export default class LicenseInfo implements ILicenseInfo {
  content?: MaybeRefOrGetter<string> | undefined;

  constructor(public subpath: string,
              public name: string,
              public author: string,
              public date: DateLike,
              public file: string|TextDocumentSourceFunc|AsyncDocumentLoader) {}
};
