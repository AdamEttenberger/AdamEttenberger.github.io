export default class EmailTemplate {
  address: string;
  params: Map;

  constructor(address: string, subject?: string, body?: string) {
    this.address = address;
    this.params = new Map([
      ['subject', subject],
      ['body', body],
    ]);
  }

  computeURIComponentString(): string {
    var result = "";
    this.params?.forEach((value, key) => {
      if (!value) {
        return;
      }
      var prefix = (result.length == 0) ? '?' : '&';
      result += `${prefix}${key}=${encodeURIComponent(value)}`;
    });
    return result;
  }

  toString(): string {
    return `mailto:${this.address}${this.computeURIComponentString()}`;
  }
}
