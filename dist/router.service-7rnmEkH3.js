var R = Object.defineProperty;
var w = (i, n, e) => n in i ? R(i, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[n] = e;
var a = (i, n, e) => w(i, typeof n != "symbol" ? n + "" : n, e);
import { R as S, a as x, c as d } from "./component-CK41B9Gk.js";
import { debounce as U } from "./utils.js";
class $ {
  constructor() {
    a(this, "rxList", null);
  }
  newRx(n = null) {
    this.rxList ?? (this.rxList = []);
    const e = new S(this.rxList, (t) => t);
    return e.update(n), e;
  }
  newRxFunc(n, ...e) {
    return this.rxList ?? (this.rxList = []), new x(this.rxList, n, { immediate: !0 }, ...e);
  }
}
class g {
  constructor(n) {
    a(this, "matcher");
    a(this, "re", /([:*])(\w+)/g);
    this.templateUrl = n, this.matcher = new m(n);
  }
  getReplacer(n) {
    return (e, t) => {
      if (!(t in n))
        throw new Error(
          `Missing route param "${t}" for template "${this.templateUrl}"`
        );
      const r = n[t];
      return e === "*" ? String(r).split("/").map((s) => encodeURIComponent(String(s))).join("/") : encodeURIComponent(String(r));
    };
  }
  build(n = {}, e, t) {
    const r = this.getReplacer(n), s = this.templateUrl.replace(
      this.re,
      (c, u, p) => r(u, p)
    ), l = e == null ? void 0 : e.toString(), o = t ? t.replace(/^#/, "") : "";
    return s + (l ? `?${l}` : "") + (o ? `#${o}` : "");
  }
}
const h = class h {
  constructor(n) {
    a(this, "names", []);
    a(this, "re");
    let e = n.replace(h.reEscape, "\\$&");
    e = e.replace(h.reParam, this.replacer.bind(this)), this.re = new RegExp("^" + e + "$");
  }
  replacer(n, e, t) {
    return this.names.push(t), e === ":" ? "([^/]*)" : "(.*)";
  }
  parse(n) {
    const e = n.match(this.re);
    if (!e) return null;
    const t = {};
    for (let r = 0; r < this.names.length; r++) {
      const s = e[r + 1], l = +s;
      t[this.names[r]] = isNaN(l) ? s : l;
    }
    return t;
  }
};
a(h, "reEscape", /[\-\[\]{}()+?.,\\\^$|#\s]/g), a(h, "reParam", /([:*])(\w+)/g);
let m = h;
const f = /* @__PURE__ */ new Set();
class y extends $ {
  constructor() {
    super();
    a(this, "rules", f);
    a(this, "completedComponentRules", []);
    a(this, "pathname$", this.newRx(""));
    a(this, "hash$", this.newRx(""));
    a(this, "search$", this.newRx(""));
    a(this, "scrollToHashElementIsBlocked", !1);
    a(this, "unblockScrollToHashElement", () => {
      this.scrollToHashElementIsBlocked = !1;
    });
    a(this, "eventListener", () => {
      this.update();
    });
    window.addEventListener("hashchange", this.eventListener), window.addEventListener("popstate", this.eventListener);
  }
  normalizePathname(e) {
    return e === "/" ? e : e.replace(/\/+$/, "");
  }
  hrefIsActive(e, t = null) {
    const r = new URL(e, window.location.origin), s = this.normalizePathname(window.location.pathname), l = this.normalizePathname(r.pathname);
    let o = t != null && t.startsWith ? s.startsWith(l) : l === s, c = !0, u = !0;
    return !(t != null && t.ignoreSearch) && r.search && (c = r.search === window.location.search), !(t != null && t.ignoreHash) && r.hash && (u = r.hash === window.location.hash), o && c && u;
  }
  getCompletedRedirectRules(e) {
    const t = [], r = this.normalizePathname(window.location.pathname);
    for (const s of e)
      s.url.matcher.parse(r) && t.push({
        redirectTo: s.redirectTo,
        url: s.url
      });
    return t;
  }
  getCompletedComponentRules(e, t) {
    const r = new Set(e.map((o) => o.url)), s = [], l = this.normalizePathname(window.location.pathname);
    for (const o of t) {
      const c = o.url.matcher.parse(l);
      if (c)
        if (r.has(o.url)) {
          const u = e.find((p) => p.url === o.url);
          u.params$.update(c), s.push(u);
        } else {
          const u = o.componentSelectorUnbox(), p = o.routeSelectorUnbox();
          s.push({
            url: o.url,
            componentSelector: u,
            routeSelector: p,
            params$: this.newRx(c),
            httpFactory: o.httpFactory,
            onLoadRoute: o.onLoadRoute,
            onUnloadRoute: o.onUnloadRoute,
            components: []
          });
        }
    }
    return s;
  }
  update(e = !1) {
    const t = new URL(window.location.href), r = this.normalizePathname(t.pathname);
    if (this.pathname$.actual !== r) {
      const { redirectRules: s, componentRules: l } = this.separateRules();
      if (!e && this.applyRedirectRulesForUrl(s)) {
        this.update(!0);
        return;
      }
      this.applyComponentRulesForUrl(l), this.pathname$.update(r);
    }
    this.hash$.actual !== t.hash && (this.hash$.update(t.hash), this.scrollToHashElement()), this.search$.actual !== t.search && this.search$.update(t.search);
  }
  scrollToHashElement() {
    var e;
    this.scrollToHashElementIsBlocked || this.hash$.actual && ((e = document.querySelector(this.hash$.actual)) == null || e.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  blockScrollToHashElement(e = 200) {
    return this.scrollToHashElementIsBlocked = !0, U(e, this.unblockScrollToHashElement);
  }
  pushHistory(e) {
    const t = new URL(e, window.location.origin), r = this.normalizePathname(t.pathname), s = r + t.search + t.hash;
    this.pathname$.actual === r && this.hash$.actual === t.hash && this.search$.actual === t.search || (history.pushState("", "", s), this.update());
  }
  pushHistoryLink(e, t) {
    e.preventDefault(), this.pushHistory(t);
  }
  separateRules() {
    const e = [], t = [];
    for (const r of this.rules) {
      let s = !1, l = !1;
      if (typeof r.componentSelectorUnbox == "function" && (s = !0), r.redirectTo && (l = !0), s && l || !s && !l)
        throw new Error(
          `Invalid options for ${JSON.stringify(r.originalParams, null, 2)}: expected either "componentSelectorUnbox" or "redirectTo"`
        );
      s ? e.push(r) : l && t.push(r);
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
      return history.replaceState(null, "", r.redirectTo), !0;
    }
    return !1;
  }
  applyComponentRulesForUrl(e) {
    const t = this.completedComponentRules, r = this.getCompletedComponentRules(t, e), s = new Set(t.map((o) => o.url)), l = new Set(r.map((o) => o.url));
    for (const o of t)
      l.has(o.url) || (typeof o.onUnloadRoute == "function" && o.onUnloadRoute(), d.removeComponents(o.components, !0));
    for (const o of r) {
      if (s.has(o.url))
        continue;
      const c = document.querySelector(o.routeSelector);
      if (!c)
        throw new Error(
          `Node for ${o.routeSelector} for ${o.componentSelector} not found`
        );
      c.innerHTML = `<${o.componentSelector}></${o.componentSelector}>`, d.connectBySelector(
        o.componentSelector,
        o.components,
        c,
        o
      ), typeof o.onLoadRoute == "function" && o.onLoadRoute();
    }
    this.completedComponentRules = r;
  }
}
const v = new y();
class E {
  constructor(n) {
    a(this, "routerLayoutIdx", 0);
    a(this, "rules", {});
    const e = Object.keys(n);
    for (const t of e) {
      const r = n[t];
      this.rules[t] = {
        ...r,
        url: new g(r.url),
        originalParams: r
      };
      const s = this.rules[t];
      typeof s.componentSelectorUnbox == "function" && typeof s.routeSelectorUnbox != "function" && (s.routeSelectorUnbox = this.getRouterOutletUnbox()), f.add(this.rules[t]);
    }
  }
  buildUrl(n, e = {}) {
    return this.rules[n].url.build(e);
  }
  getRouterOutletUnbox() {
    const n = this.routerLayoutIdx++;
    return () => `.router-outlet-${n}`;
  }
  destroy() {
    const n = Object.keys(this.rules);
    for (const e of n)
      f.delete(this.rules[e]);
  }
}
export {
  $ as A,
  E as R,
  v as r
};
//# sourceMappingURL=router.service-7rnmEkH3.js.map
