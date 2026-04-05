var L = Object.defineProperty;
var y = (l, o, e) => o in l ? L(l, o, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[o] = e;
var h = (l, o, e) => y(l, typeof o != "symbol" ? o + "" : o, e);
import { R as P, a as $, c as U } from "./component-CK41B9Gk.js";
class b {
  constructor() {
    h(this, "rxList", null);
  }
  newRx(o = null) {
    this.rxList ?? (this.rxList = []);
    const e = new P(this.rxList, (t) => t);
    return e.update(o), e;
  }
  newRxFunc(o, ...e) {
    return this.rxList ?? (this.rxList = []), new $(this.rxList, o, { immediate: !0 }, ...e);
  }
}
class v {
  constructor(o) {
    h(this, "matcher");
    h(this, "re", /([:*])(\w+)/g);
    this.templateUrl = o, this.matcher = new d(o);
  }
  getReplacer(o) {
    return (e, t) => {
      if (!(t in o))
        throw new Error(
          `Missing route param "${t}" for template "${this.templateUrl}"`
        );
      const r = o[t];
      return e === "*" ? String(r).split("/").map((n) => encodeURIComponent(String(n))).join("/") : encodeURIComponent(String(r));
    };
  }
  build(o = {}, e) {
    const t = this.getReplacer(o), r = this.templateUrl.replace(
      this.re,
      (s, i, c) => t(i, c)
    ), n = e == null ? void 0 : e.toString(), a = n ? `?${n}` : "";
    return r + a;
  }
}
const p = class p {
  constructor(o) {
    h(this, "names", []);
    h(this, "re");
    let e = o.replace(p.reEscape, "\\$&");
    e = e.replace(p.reParam, this.replacer.bind(this)), this.re = new RegExp("^" + e + "$");
  }
  replacer(o, e, t) {
    return this.names.push(t), e === ":" ? "([^/]*)" : "(.*)";
  }
  parse(o) {
    const e = o.match(this.re);
    if (!e) return null;
    const t = {};
    for (let r = 0; r < this.names.length; r++) {
      const n = e[r + 1], a = +n;
      t[this.names[r]] = isNaN(a) ? n : a;
    }
    return t;
  }
};
h(p, "reEscape", /[\-\[\]{}()+?.,\\\^$|#\s]/g), h(p, "reParam", /([:*])(\w+)/g);
let d = p;
const m = /* @__PURE__ */ new Set();
class C extends b {
  constructor() {
    super();
    h(this, "rules", m);
    h(this, "completedComponentRules", []);
    h(this, "pathname$", this.newRx(""));
    h(this, "search$", this.newRx(""));
    h(this, "hashMode", !1);
    h(this, "eventListener", () => {
      this.update();
    });
    window.addEventListener("hashchange", this.eventListener), window.addEventListener("popstate", this.eventListener);
  }
  normalizePathname(e) {
    return e === "/" ? e : e.replace(/\/+$/, "");
  }
  parseHashRoute(e) {
    if (!e || e === "#") return { path: "/", search: "" };
    let t = e.startsWith("#") ? e.slice(1) : e;
    const r = t.indexOf("?"), n = r >= 0 ? t.slice(0, r) : t, a = r >= 0 ? t.slice(r) : "", s = n.replace(/^\/+/, "");
    return { path: s === "" ? "/" : this.normalizePathname("/" + s), search: a };
  }
  getRoutedPathname(e) {
    return this.hashMode ? this.parseHashRoute(e.hash).path : this.normalizePathname(e.pathname);
  }
  getRoutedSearch(e) {
    return this.hashMode ? this.parseHashRoute(e.hash).search : e.search;
  }
  buildHashModeLocationUrl(e) {
    return window.location.pathname + window.location.search + e;
  }
  redirectToHistoryUrl(e) {
    if (!this.hashMode) return e;
    const t = new URL(e, window.location.origin);
    let r, n;
    if (t.hash && t.hash.startsWith("#/")) {
      const s = this.parseHashRoute(t.hash);
      r = s.path, n = s.search;
    } else
      r = this.normalizePathname(t.pathname), n = t.search;
    const a = "#/" + r.replace(/^\//, "") + n;
    return this.buildHashModeLocationUrl(a);
  }
  setHashMode(e) {
    this.hashMode = e;
  }
  isHashMode() {
    return this.hashMode;
  }
  hrefIsActive(e, t = null) {
    const r = new URL(e, window.location.origin), n = new URL(window.location.href);
    if (this.hashMode) {
      const f = r.hash ? this.parseHashRoute(r.hash).path : this.normalizePathname(r.pathname), R = r.hash ? this.parseHashRoute(r.hash).search : r.search, w = this.getRoutedPathname(n), g = this.getRoutedSearch(n);
      let x = t != null && t.startsWith ? w.startsWith(f) : f === w, S = !0;
      return !(t != null && t.ignoreSearch) && R && (S = R === g), x && S;
    }
    const a = this.normalizePathname(window.location.pathname), s = this.normalizePathname(r.pathname);
    let i = t != null && t.startsWith ? a.startsWith(s) : s === a, c = !0, u = !0;
    return !(t != null && t.ignoreSearch) && r.search && (c = r.search === window.location.search), r.hash && (u = r.hash === window.location.hash), i && c && u;
  }
  getCompletedRedirectRules(e) {
    const t = [], r = this.getRoutedPathname(new URL(window.location.href));
    for (const n of e)
      n.url.matcher.parse(r) && t.push({
        redirectTo: n.redirectTo,
        url: n.url
      });
    return t;
  }
  getCompletedComponentRules(e, t) {
    const r = new Set(e.map((s) => s.url)), n = [], a = this.getRoutedPathname(new URL(window.location.href));
    for (const s of t) {
      const i = s.url.matcher.parse(a);
      if (i)
        if (r.has(s.url)) {
          const c = e.find((u) => u.url === s.url);
          c.params$.update(i), n.push(c);
        } else {
          const c = s.componentSelectorUnbox(), u = s.routeSelectorUnbox();
          n.push({
            url: s.url,
            componentSelector: c,
            routeSelector: u,
            params$: this.newRx(i),
            httpFactory: s.httpFactory,
            onLoadRoute: s.onLoadRoute,
            onUnloadRoute: s.onUnloadRoute,
            components: []
          });
        }
    }
    return n;
  }
  update(e = !1) {
    const t = new URL(window.location.href), r = this.getRoutedPathname(t), n = this.getRoutedSearch(t);
    if (this.pathname$.actual !== r) {
      const { redirectRules: a, componentRules: s } = this.separateRules();
      if (!e && this.applyRedirectRulesForUrl(a)) {
        this.update(!0);
        return;
      }
      this.applyComponentRulesForUrl(s), this.pathname$.update(r);
    }
    this.search$.actual !== n && this.search$.update(n);
  }
  pushHistory(e) {
    const t = new URL(e, window.location.origin);
    if (this.hashMode) {
      let a, s;
      if (t.hash && t.hash.startsWith("#/")) {
        const c = this.parseHashRoute(t.hash);
        a = c.path, s = c.search;
      } else
        a = this.normalizePathname(t.pathname), s = t.search;
      const i = "#/" + a.replace(/^\//, "") + s;
      if (window.location.hash === i) return;
      history.pushState(null, "", this.buildHashModeLocationUrl(i)), this.update();
      return;
    }
    const r = this.normalizePathname(t.pathname), n = r + t.search + t.hash;
    this.pathname$.actual === r && this.search$.actual === t.search && window.location.hash === t.hash || (history.pushState("", "", n), this.update());
  }
  pushHistoryLink(e, t) {
    e.preventDefault(), this.pushHistory(t);
  }
  separateRules() {
    const e = [], t = [];
    for (const r of this.rules) {
      let n = !1, a = !1;
      if (typeof r.componentSelectorUnbox == "function" && (n = !0), r.redirectTo && (a = !0), n && a || !n && !a)
        throw new Error(
          `Invalid options for ${JSON.stringify(r.originalParams, null, 2)}: expected either "componentSelectorUnbox" or "redirectTo"`
        );
      n ? e.push(r) : a && t.push(r);
    }
    return {
      componentRules: e,
      redirectRules: t
    };
  }
  applyRedirectRulesForUrl(e) {
    const t = this.getCompletedRedirectRules(e);
    if (t.length) {
      const r = t[t.length - 1];
      return history.replaceState(null, "", this.redirectToHistoryUrl(r.redirectTo)), !0;
    }
    return !1;
  }
  applyComponentRulesForUrl(e) {
    const t = this.completedComponentRules, r = this.getCompletedComponentRules(t, e), n = new Set(t.map((s) => s.url)), a = new Set(r.map((s) => s.url));
    for (const s of t)
      a.has(s.url) || (typeof s.onUnloadRoute == "function" && s.onUnloadRoute(), U.removeComponents(s.components, !0));
    for (const s of r) {
      if (n.has(s.url)) continue;
      const i = document.querySelector(s.routeSelector);
      if (!i)
        throw new Error(
          `Node for ${s.routeSelector} for ${s.componentSelector} not found`
        );
      i.innerHTML = `<${s.componentSelector}></${s.componentSelector}>`, U.connectBySelector(
        s.componentSelector,
        s.components,
        i,
        s
      ), typeof s.onLoadRoute == "function" && s.onLoadRoute();
    }
    this.completedComponentRules = r;
  }
}
const H = new C();
class z {
  constructor(o) {
    h(this, "routerLayoutIdx", 0);
    h(this, "rules", {});
    const e = Object.keys(o);
    for (const t of e) {
      const r = o[t];
      this.rules[t] = {
        ...r,
        url: new v(r.url),
        originalParams: r
      };
      const n = this.rules[t];
      typeof n.componentSelectorUnbox == "function" && typeof n.routeSelectorUnbox != "function" && (n.routeSelectorUnbox = this.getRouterOutletUnbox()), m.add(this.rules[t]);
    }
  }
  buildUrl(o, e = {}, t) {
    const r = this.rules[o].url.build(e, t);
    if (!H.isHashMode()) return r;
    const n = new URL(r, "http://router.invalid");
    return `#/${n.pathname.replace(/^\//, "")}${n.search}`;
  }
  getRouterOutletUnbox() {
    const o = this.routerLayoutIdx++;
    return () => `.router-outlet-${o}`;
  }
  destroy() {
    const o = Object.keys(this.rules);
    for (const e of o)
      m.delete(this.rules[e]);
  }
}
export {
  b as A,
  z as R,
  H as r
};
//# sourceMappingURL=router.service-D899kAWK.js.map
