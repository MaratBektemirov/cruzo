export class RouteUrl<A extends Record<string, any> = {}> {
  matcher: RouteMatcher;
  private re = /([:*])(\w+)/g;

  constructor(public templateUrl: string) {
    this.matcher = new RouteMatcher(templateUrl);
  }

  private getReplacer(params: A) {
    return (mode: string, name: string) => {
      if (!(name in params)) {
        throw new Error(
          `Missing route param "${name}" for template "${this.templateUrl}"`,
        );
      }

      const raw = params[name];

      if (mode === "*") {
        return String(raw)
          .split("/")
          .map((v) => encodeURIComponent(String(v)))
          .join("/");
      }

      return encodeURIComponent(String(raw));
    };
  }

  public build(params: A = {} as A, query?: URLSearchParams) {
    const replacer = this.getReplacer(params);
    const path = this.templateUrl.replace(this.re, (_, mode, name) =>
      replacer(mode, name),
    );

    const q = query?.toString();
    const qstr = q ? `?${q}` : "";

    return path + qstr;
  }
}

export class RouteMatcher {
  static reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
  static reParam = /([:*])(\w+)/g;

  private names: string[] = [];
  private re: RegExp;

  constructor(route: string) {
    let reSrc = route.replace(RouteMatcher.reEscape, "\\$&");
    reSrc = reSrc.replace(RouteMatcher.reParam, this.replacer.bind(this));

    this.re = new RegExp("^" + reSrc + "$");
  }

  private replacer(_: string, mode: string, name: string) {
    this.names.push(name);
    return mode === ":" ? "([^/]*)" : "(.*)";
  }

  public parse(url: string) {
    const m = url.match(this.re);
    if (!m) return null;

    const params: any = {};
    for (let i = 0; i < this.names.length; i++) {
      const v = m[i + 1];
      const n = +v;
      params[this.names[i]] = isNaN(n) ? v : n;
    }
    return params;
  }
}
