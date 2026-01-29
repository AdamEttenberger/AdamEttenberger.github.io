export default class DateUtil {
  static toDate(value: any): Date {
    if (value instanceof Date) {
      return value;
    }
    switch (typeof value) {
      case 'string':
      case 'number':
        var date = new Date(value);
        if (!isNaN(date)) {
          return date;
        }
        break;
    }
    // Automatically unwrap Vue references
    if (value.value) {
      return DateUtil.toDate(value.value);
    }
  }

  static formatJSON(value: any): String {
    return DateUtil.toDate(value)?.toJSON() ?? "";
  }

  static formatShortDate(value: any): String {
    return DateUtil.toDate(value)?.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
    }) ?? "";
  }

  static formatLongDate(value: any): String {
    return DateUtil.toDate(value)?.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    }) ?? "";
  }

  static formatYearMonthDay(value: any): String {
    var date = DateUtil.toDate(value);
    if (!date) {
      return "";
    }
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
  }

  static formatYearMonthDayTime(value: any): String {
    var date = DateUtil.toDate(value);
    if (!date) {
      return "";
    }
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  static formatUTCString(value: any): String {
    var date = DateUtil.toDate(value);
    if (!date) {
      return "";
    }
    return date.toUTCString();
  }

  static formatMLA(value: any): String {
    var date = DateUtil.toDate(value);
    if (!date) {
      return "";
    }
    return [
      date.toLocaleDateString(undefined, { day: 'numeric' }),
      date.toLocaleDateString(undefined, { month: 'short' }),
      date.toLocaleDateString(undefined, { year: 'numeric' }),
    ].join(' ');
  }
}
