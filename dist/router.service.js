var y = Object.defineProperty;
var L = (f, h, e) => h in f ? y(f, h, { enumerable: !0, configurable: !0, writable: !0, value: e }) : f[h] = e;
var p = (f, h, e) => L(f, typeof h != "symbol" ? h + "" : h, e);
import { AbstractService as P } from "./service.js";
import { componentsRegistryService as S } from "./components-registry.service.js";
import { RouteUrl as x } from "./route-url.js";
const g = /* @__PURE__ */ new Set();
class $ extends P {
  constructor() {
    super();
    p(this, "rules", g);
    p(this, "completedComponentRules", []);
    p(this, "pathname$", this.newRx(""));
    p(this, "search$", this.newRx(""));
    p(this, "resourcesLoading$", this.newRx(!1));
    p(this, "hashMode", !1);
    p(this, "eventListener", () => {
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
    const o = t.indexOf("?"), r = o >= 0 ? t.slice(0, o) : t, a = o >= 0 ? t.slice(o) : "", s = r.replace(/^\/+/, "");
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
    let o, r;
    if (t.hash && t.hash.startsWith("#/")) {
      const s = this.parseHashRoute(t.hash);
      o = s.path, r = s.search;
    } else
      o = this.normalizePathname(t.pathname), r = t.search;
    const a = "#/" + o.replace(/^\//, "") + r;
    return this.buildHashModeLocationUrl(a);
  }
  setHashMode(e) {
    this.hashMode = e;
  }
  isHashMode() {
    return this.hashMode;
  }
  hrefIsActive(e, t = null) {
    const o = new URL(e, window.location.origin), r = new URL(window.location.href);
    if (this.hashMode) {
      const R = o.hash ? this.parseHashRoute(o.hash).path : this.normalizePathname(o.pathname), m = o.hash ? this.parseHashRoute(o.hash).search : o.search, w = this.getRoutedPathname(r), n = this.getRoutedSearch(r);
      let u = t != null && t.startsWith ? w.startsWith(R) : R === w, l = !0;
      return !(t != null && t.ignoreSearch) && m && (l = m === n), u && l;
    }
    const a = this.normalizePathname(window.location.pathname), s = this.normalizePathname(o.pathname);
    let i = t != null && t.startsWith ? a.startsWith(s) : s === a, c = !0, d = !0;
    return !(t != null && t.ignoreSearch) && o.search && (c = o.search === window.location.search), o.hash && (d = o.hash === window.location.hash), i && c && d;
  }
  getCompletedRedirectRules(e) {
    const t = [], o = this.getRoutedPathname(new URL(window.location.href));
    for (const r of e)
      r.url.matcher.parse(o) && t.push({
        redirectTo: r.redirectTo,
        url: r.url
      });
    return t;
  }
  getCompletedComponentRules(e, t) {
    const o = new Set(e.map((s) => s.url)), r = [], a = this.getRoutedPathname(new URL(window.location.href));
    for (const s of t) {
      const i = s.url.matcher.parse(a);
      if (i)
        if (o.has(s.url)) {
          const c = e.find((d) => d.url === s.url);
          c.params$.update(i), r.push(c);
        } else {
          const c = s.componentSelectorUnbox(), d = s.routeSelectorUnbox();
          r.push({
            url: s.url,
            componentSelector: c,
            routeSelector: d,
            params$: this.newRx(i),
            httpFactory: s.httpFactory,
            onLoadRoute: s.onLoadRoute,
            onUnloadRoute: s.onUnloadRoute,
            components: []
          });
        }
    }
    return r;
  }
  update(e = !1) {
    const t = new URL(window.location.href), o = this.getRoutedPathname(t), r = this.getRoutedSearch(t);
    if (this.pathname$.actual !== o) {
      const { redirectRules: a, componentRules: s } = this.separateRules();
      if (!e && this.applyRedirectRulesForUrl(a)) {
        this.update(!0);
        return;
      }
      this.applyComponentRulesForUrl(s, o);
    }
    this.search$.actual !== r && this.search$.update(r);
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
    const o = this.normalizePathname(t.pathname), r = o + t.search + t.hash;
    this.pathname$.actual === o && this.search$.actual === t.search && window.location.hash === t.hash || (history.pushState("", "", r), this.update());
  }
  pushHistoryLink(e, t) {
    e.preventDefault(), this.pushHistory(t);
  }
  separateRules() {
    const e = [], t = [];
    for (const o of this.rules) {
      let r = !1, a = !1;
      if (typeof o.componentSelectorUnbox == "function" && (r = !0), o.redirectTo && (a = !0), r && a || !r && !a)
        throw new Error(
          `Invalid options for ${JSON.stringify(o.originalParams, null, 2)}: expected either "componentSelectorUnbox" or "redirectTo"`
        );
      r ? e.push(o) : a && t.push(o);
    }
    return {
      componentRules: e,
      redirectRules: t
    };
  }
  applyRedirectRulesForUrl(e) {
    const t = this.getCompletedRedirectRules(e);
    if (t.length) {
      const o = t[t.length - 1];
      return history.replaceState(null, "", this.redirectToHistoryUrl(o.redirectTo)), !0;
    }
    return !1;
  }
  applyComponentRulesForUrl(e, t) {
    var w;
    const o = this.completedComponentRules, r = this.getCompletedComponentRules(o, e), a = new Set(o.map((n) => n.url)), s = new Set(r.map((n) => n.url));
    for (const n of o)
      s.has(n.url) || ((w = n.onUnloadRoute) == null || w.call(n), S.removeComponents(n.components, !0));
    const i = r.filter((n) => !a.has(n.url)), c = () => this.getRoutedPathname(new URL(window.location.href)) !== t, d = () => {
      c() || (this.completedComponentRules = r, this.pathname$.update(t));
    };
    if (!i.length) {
      d();
      return;
    }
    const R = i.some((n) => {
      const u = e.find((l) => l.url === n.url);
      return typeof (u == null ? void 0 : u.loadResources) == "function";
    });
    R && this.resourcesLoading$.update(!0);
    let m = Promise.resolve();
    for (const n of i) {
      const u = e.find((l) => l.url === n.url);
      m = m.then(() => {
        var l;
        return (l = u == null ? void 0 : u.loadResources) == null ? void 0 : l.call(u);
      }).then(() => {
        var U;
        if (c()) return;
        const l = document.querySelector(n.routeSelector);
        if (!l)
          throw new Error(
            `Node for ${n.routeSelector} for ${n.componentSelector} not found`
          );
        l.innerHTML = `<${n.componentSelector}></${n.componentSelector}>`, S.connectBySelector(
          n.componentSelector,
          n.components,
          l,
          n
        ), (U = n.onLoadRoute) == null || U.call(n);
      });
    }
    m.then(d).catch(() => {
    }).finally(() => {
      R && this.resourcesLoading$.update(!1);
    });
  }
}
const b = new $();
class z {
  constructor(h) {
    p(this, "routerLayoutIdx", 0);
    p(this, "rules", {});
    const e = Object.keys(h);
    for (const t of e) {
      const o = h[t];
      this.rules[t] = {
        ...o,
        url: new x(o.url),
        originalParams: o
      };
      const r = this.rules[t];
      typeof r.componentSelectorUnbox == "function" && typeof r.routeSelectorUnbox != "function" && (r.routeSelectorUnbox = this.getRouterOutletUnbox()), g.add(this.rules[t]);
    }
  }
  buildUrl(h, e = {}, t) {
    const o = this.rules[h].url.build(e, t);
    if (!b.isHashMode()) return o;
    const r = new URL(o, "http://router.invalid");
    return `#/${r.pathname.replace(/^\//, "")}${r.search}`;
  }
  getRouterOutletUnbox() {
    const h = this.routerLayoutIdx++;
    return () => `.router-outlet-${h}`;
  }
}
export {
  z as RouteUrlBucket,
  b as routerService
};
//# sourceMappingURL=router.service.js.map
