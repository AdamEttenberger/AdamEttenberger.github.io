import { toValue, type MaybeRefOrGetter } from 'vue'

export type DateLike = number|string|Date;

export function date_from(from_utc: MaybeRefOrGetter<DateLike>): Date {
  const value = toValue(from_utc);
  return (value instanceof Date) ? value : new Date(value);
}

export function date_same_year(a: MaybeRefOrGetter<DateLike>, b: MaybeRefOrGetter<DateLike>): boolean {
  const first: Date = date_from(a);
  const second: Date = date_from(b);
  return first.getUTCFullYear() == second.getUTCFullYear();
}

export function date_same_month(a: MaybeRefOrGetter<DateLike>, b: MaybeRefOrGetter<DateLike>): boolean {
  const first: Date = date_from(a);
  const second: Date = date_from(b);
  return first.getUTCFullYear() == second.getUTCFullYear() &&
         first.getUTCMonth() == second.getUTCMonth();
}

export function date_same_day(a: MaybeRefOrGetter<DateLike>, b: MaybeRefOrGetter<DateLike>): boolean {
  const first: Date = date_from(a);
  const second: Date = date_from(b);
  return first.getUTCFullYear() == second.getUTCFullYear() &&
         first.getUTCMonth() == second.getUTCMonth() &&
         first.getUTCDate() == second.getUTCDate();
}

export function date_formatJSON(value: MaybeRefOrGetter<DateLike>): string {
  return date_from(value).toJSON();
}

export function date_formatShortDate(value: MaybeRefOrGetter<DateLike>): string {
  return date_from(value).toLocaleDateString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
  });
}

export function date_formatLongDate(value: MaybeRefOrGetter<DateLike>): string {
  return date_from(value).toLocaleDateString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
  });
}

export function date_formatYear(value: MaybeRefOrGetter<DateLike>): string {
  return date_from(value).toLocaleDateString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
  });
}

export function date_formatYearMonthDay(value: MaybeRefOrGetter<DateLike>): string {
  const date = date_from(value);
  return [
    date.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric' }),
    date.toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short' }),
    date.toLocaleDateString(undefined, { timeZone: 'UTC', day: 'numeric' }),
  ].join('/');
}

export function date_formatTime(value: MaybeRefOrGetter<DateLike>, hour12: boolean = false): string {
  return date_from(value).toLocaleTimeString(undefined, {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12
  });
}

export function date_formatYearMonthDayTime(value: MaybeRefOrGetter<DateLike>, hour12: boolean = false): string {
  const date = date_from(value);
  return `${date_formatYearMonthDay(date)} ${date_formatTime(date, hour12)}`;
}

export function date_formatUTCString(value: MaybeRefOrGetter<DateLike>): string {
  return date_from(value).toUTCString();
}

export function date_formatMLA(value: MaybeRefOrGetter<DateLike>): string {
  const date = date_from(value);
  return [
    date.toLocaleDateString(undefined, { timeZone: 'UTC', day: 'numeric' }),
    date.toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short' }),
    date.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric' }),
  ].join(' ');
}
