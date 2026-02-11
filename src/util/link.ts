import { unref } from 'vue'
import EmailTemplate from "@/types/email_template";

export enum LinkType {
  Route = 'route',
  External = 'external',
  Email = 'email',
  Empty = 'empty',
};

export default class LinkUtil {
  static type(value: string | EmailTemplate) {
    value = unref(value);
    if (value instanceof EmailTemplate) {
      // Delegate email validation if required to
      // class EmailTemplate and the caller.
      return (value as EmailTemplate).address?.length
          ? LinkType.Email
          : LinkType.Empty;
    }
    if (typeof value === 'string' && value.length) {
      // Requires another method to detect "public" absolute paths.
      return ((value.startsWith('#/') || value.startsWith('/')))
          ? LinkType.Route
          : LinkType.External;
    }
    return LinkType.Empty;
  }

  static route(value: string): boolean {
    return LinkUtil.type(value) === LinkType.Route;
  }
  static external(value: string): boolean {
    return LinkUtil.type(value) === LinkType.External;
  }
  static mail(value: string): boolean {
    return LinkUtil.type(value) === LinkType.Email;
  }
};
