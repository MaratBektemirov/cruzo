var R = Object.defineProperty;
var w = (a, n, t) => n in a ? R(a, n, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[n] = t;
var c = (a, n, t) => w(a, typeof n != "symbol" ? n + "" : n, t);
import { R as S, a as x, c as d } from "./component-CH-TJ5VF.js";
import { debounce as U } from "./utils.js";
class g {
  constructor() {
    c(this, "rxList", null);
  }
  newRx(n = null) {
    this.rxList ?? (this.rxList = []);
    const t = new S(this.rxList, (e) => e);
    return t.update(n), t;
  }
  newRxFunc(n, ...t) {
    return this.rxList ?? (this.rxList = []), new x(this.rxList, n, { immediate: !0 }, ...t);
  }
}
class $ {
  constructor(n) {
    c(this, "matcher");
    c(this, "re", /([:*])(\w+)/g);
    this.templateUrl = n, this.matcher = new m(n);
  }
  getReplacer(n) {
    return (t, e) => {
      if (!(e in n))
        throw new Error(
          `Missing route param "${e}" for template "${this.templateUrl}"`
        );
      const o = n[e];
      return t === "*" ? String(o).split("/").map((s) => encodeURIComponent(String(s))).join("/") : encodeURIComponent(String(o));
    };
  }
  build(n = {}, t, e) {
    const o = this.getReplacer(n), s = this.templateUrl.replace(
      this.re,
      (i, u, p) => o(u, p)
    ), l = t == null ? void 0 : t.toString(), r = e ? e.replace(/^#/, "") : "";
    return s + (l ? `?${l}` : "") + (r ? `#${r}` : "");
  }
}
const h = class h {
  constructor(n) {
    c(this, "names", []);
    c(this, "re");
    let t = n.replace(h.reEscape, "\\$&");
    t = t.replace(h.reParam, this.replacer.bind(this)), this.re = new RegExp("^" + t + "$");
  }
  replacer(n, t, e) {
    return this.names.push(e), t === ":" ? "([^/]*)" : "(.*)";
  }
  parse(n) {
    const t = n.match(this.re);
    if (!t) return null;
    const e = {};
    for (let o = 0; o < this.names.length; o++) {
      const s = t[o + 1], l = +s;
      e[this.names[o]] = isNaN(l) ? s : l;
    }
    return e;
  }
};
c(h, "reEscape", /[\-\[\]{}()+?.,\\\^$|#\s]/g), c(h, "reParam", /([:*])(\w+)/g);
let m = h;
const f = /* @__PURE__ */ new Set();
class y extends g {
  constructor() {
    super();
    c(this, "rules", f);
    c(this, "completedComponentRules", []);
    c(this, "pathname$", this.newRx(""));
    c(this, "hash$", this.newRx(""));
    c(this, "search$", this.newRx(""));
    c(this, "scrollToHashElementIsBlocked", !1);
    c(this, "unblockScrollToHashElement", () => {
      this.scrollToHashElementIsBlocked = !1;
    });
    c(this, "eventListener", () => {
      this.update();
    });
    window.addEventListener("hashchange", this.eventListener), window.addEventListener("popstate", this.eventListener);
  }
  hrefIsActive(t, e = null) {
    const o = new URL(t, window.location.origin);
    let s = e != null && e.startsWith ? window.location.pathname.startsWith(o.pathname) : o.pathname === window.location.pathname, l = !0, r = !0;
    return !(e != null && e.ignoreSearch) && o.search && (l = o.search === window.location.search), !(e != null && e.ignoreHash) && o.hash && (r = o.hash === window.location.hash), s && l && r;
  }
  getCompletedRedirectRules(t) {
    const e = [], o = window.location.pathname;
    for (const s of t)
      s.url.matcher.parse(o) && e.push({
        redirectTo: s.redirectTo,
        url: s.url
      });
    return e;
  }
  getCompletedComponentRules(t, e) {
    const o = new Set(t.map((r) => r.url)), s = [], l = window.location.pathname;
    for (const r of e) {
      const i = r.url.matcher.parse(l);
      if (i)
        if (o.has(r.url)) {
          const u = t.find((p) => p.url === r.url);
          u.params$.update(i), s.push(u);
        } else {
          const u = r.componentSelectorUnbox(), p = r.routeSelectorUnbox();
          s.push({
            url: r.url,
            componentSelector: u,
            routeSelector: p,
            params$: this.newRx(i),
            httpFactory: r.httpFactory,
            onLoadRoute: r.onLoadRoute,
            onUnloadRoute: r.onUnloadRoute,
            components: []
          });
        }
    }
    return s;
  }
  update(t = !1) {
    const e = new URL(window.location.href);
    if (this.pathname$.actual !== e.pathname) {
      const { redirectRules: o, componentRules: s } = this.separateRules();
      if (!t && this.applyRedirectRulesForUrl(o)) {
        this.update(!0);
        return;
      }
      this.applyComponentRulesForUrl(s), this.pathname$.update(e.pathname);
    }
    this.hash$.actual !== e.hash && (this.hash$.update(e.hash), this.scrollToHashElement()), this.search$.actual !== e.search && this.search$.update(e.search);
  }
  scrollToHashElement() {
    var t;
    this.scrollToHashElementIsBlocked || this.hash$.actual && ((t = document.querySelector(this.hash$.actual)) == null || t.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  blockScrollToHashElement(t = 200) {
    return this.scrollToHashElementIsBlocked = !0, U(t, this.unblockScrollToHashElement);
  }
  pushHistory(t) {
    const e = new URL(t, window.location.origin);
    this.pathname$.actual === e.pathname && this.hash$.actual === e.hash && this.search$.actual === e.search || (history.pushState("", "", t), this.update());
  }
  pushHistoryLink(t, e) {
    t.preventDefault(), this.pushHistory(e);
  }
  separateRules() {
    const t = [], e = [];
    for (const o of this.rules) {
      let s = !1, l = !1;
      if (typeof o.componentSelectorUnbox == "function" && (s = !0), o.redirectTo && (l = !0), s && l || !s && !l)
        throw new Error(
          `Invalid options for ${JSON.stringify(o.originalParams, null, 2)}: expected either "componentSelectorUnbox" or "redirectTo"`
        );
      s ? t.push(o) : l && e.push(o);
    }
    return {
      componentRules: t,
      redirectRules: e
    };
  }
  applyRedirectRulesForUrl(t) {
    const e = this.getCompletedRedirectRules(t);
    if (e.length) {
      const o = e[e.length - 1];
      return history.replaceState(null, "", o.redirectTo), !0;
    }
    return !1;
  }
  applyComponentRulesForUrl(t) {
    const e = this.completedComponentRules, o = this.getCompletedComponentRules(e, t), s = new Set(e.map((r) => r.url)), l = new Set(o.map((r) => r.url));
    for (const r of e)
      l.has(r.url) || (typeof r.onUnloadRoute == "function" && r.onUnloadRoute(), d.removeComponents(r.components, !0));
    for (const r of o) {
      if (s.has(r.url))
        continue;
      const i = document.querySelector(r.routeSelector);
      if (!i)
        throw new Error(
          `Node for ${r.routeSelector} for ${r.componentSelector} not found`
        );
      i.innerHTML = `<${r.componentSelector}></${r.componentSelector}>`, d.connectBySelector(
        r.componentSelector,
        r.components,
        i,
        r
      ), typeof r.onLoadRoute == "function" && r.onLoadRoute();
    }
    this.completedComponentRules = o;
  }
}
const v = new y();
class E {
  constructor(n) {
    c(this, "routerLayoutIdx", 0);
    c(this, "rules", {});
    const t = Object.keys(n);
    for (const e of t) {
      const o = n[e];
      this.rules[e] = {
        ...o,
        url: new $(o.url),
        originalParams: o
      };
      const s = this.rules[e];
      typeof s.componentSelectorUnbox == "function" && typeof s.routeSelectorUnbox != "function" && (s.routeSelectorUnbox = this.getRouterOutletUnbox()), f.add(this.rules[e]);
    }
  }
  buildUrl(n, t = {}) {
    return this.rules[n].url.build(t);
  }
  getRouterOutletUnbox() {
    const n = this.routerLayoutIdx++;
    return () => `.router-outlet-${n}`;
  }
  destroy() {
    const n = Object.keys(this.rules);
    for (const t of n)
      f.delete(this.rules[t]);
  }
}
export {
  g as A,
  E as R,
  v as r
};
//# sourceMappingURL=router.service-DV3XpaVO.js.map
