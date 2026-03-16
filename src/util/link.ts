import { unref } from 'vue'
import EmailTemplate from "@/types/email_template";

export enum LinkType {
  Route = 'route',
  External = 'external',
  Email = 'email',
  Empty = 'empty',
};

export function link_type(value: undefined|null|string|EmailTemplate): LinkType {
  value = unref(value);
  if (value instanceof EmailTemplate) {
    // Delegate email validation if required to
    // class EmailTemplate and the caller.
    return value.address.length
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

export function link_route(value: string): boolean {
  return link_type(value) === LinkType.Route;
}
export function link_external(value: string): boolean {
  return link_type(value) === LinkType.External;
}
export function link_mail(value: string): boolean {
  return link_type(value) === LinkType.Email;
}
