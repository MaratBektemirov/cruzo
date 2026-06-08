var m = Object.defineProperty;
var g = (a, t, r) => t in a ? m(a, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : a[t] = r;
var i = (a, t, r) => g(a, typeof t != "symbol" ? t + "" : t, r);
class $ {
  constructor(t) {
    i(this, "matcher");
    i(this, "re", /([:*])(\w+)/g);
    this.templateUrl = t, this.matcher = new l(t);
  }
  getReplacer(t) {
    return (r, e) => {
      if (!(e in t))
        throw new Error(
          `Missing route param "${e}" for template "${this.templateUrl}"`
        );
      const s = t[e];
      return r === "*" ? String(s).split("/").map((n) => encodeURIComponent(String(n))).join("/") : encodeURIComponent(String(s));
    };
  }
  build(t = {}, r) {
    const e = this.getReplacer(t), s = this.templateUrl.replace(
      this.re,
      (u, p, h) => e(p, h)
    ), n = r == null ? void 0 : r.toString(), o = n ? `?${n}` : "";
    return s + o;
  }
}
const c = class c {
  constructor(t) {
    i(this, "names", []);
    i(this, "re");
    let r = t.replace(c.reEscape, "\\$&");
    r = r.replace(c.reParam, this.replacer.bind(this)), this.re = new RegExp("^" + r + "$");
  }
  replacer(t, r, e) {
    return this.names.push(e), r === ":" ? "([^/]*)" : "(.*)";
  }
  parse(t) {
    const r = t.match(this.re);
    if (!r) return null;
    const e = {};
    for (let s = 0; s < this.names.length; s++) {
      const n = r[s + 1], o = +n;
      e[this.names[s]] = isNaN(o) ? n : o;
    }
    return e;
  }
};
i(c, "reEscape", /[\-\[\]{}()+?.,\\\^$|#\s]/g), i(c, "reParam", /([:*])(\w+)/g);
let l = c;
export {
  l as RouteMatcher,
  $ as RouteUrl
};
//# sourceMappingURL=route-url.js.map
