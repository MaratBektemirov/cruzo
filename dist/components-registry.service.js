var S = Object.defineProperty;
var f = (s, t, e) => t in s ? S(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var a = (s, t, e) => f(s, typeof t != "symbol" ? t + "" : t, e);
class m {
  constructor() {
    a(this, "instancesBySelector", {});
    a(this, "componentsRoot", []);
    a(this, "buckets", {});
    a(this, "listBySelector", /* @__PURE__ */ new Map());
  }
  removeComponents(t, e = !1) {
    for (; t.length; ) {
      const c = t.pop();
      c.disconnectedCallback(e), B.instancesBySelector[c.selector].delete(
        c.node
      );
    }
  }
  define(t) {
    this.listBySelector.set(t.selector, t);
  }
  connectBySelector(t, e, c = document, n = null) {
    const p = c.querySelectorAll(t), l = Array.from(p), y = [];
    if (l.length) {
      const h = this.listBySelector.get(t);
      if (!h)
        throw new Error(
          `${t} component is not defined. Call componentsRegistryService.define(...)`
        );
      for (const r of l) {
        this.instancesBySelector[t] = this.instancesBySelector[t] || /* @__PURE__ */ new Map();
        let o = this.instancesBySelector[t].get(r);
        if (!o) {
          o = new h(), o.selector = t, o.node = r;
          let i = null;
          n != null && n.httpFactory && (i ?? (i = {}), i.httpFactory = n.httpFactory), n != null && n.params$ && (i ?? (i = {}), i.routeParams$ = n.params$);
          try {
            o.connectedCallback(i), e.push(o), this.instancesBySelector[t].set(r, o), y.push(o);
          } catch (d) {
            throw d;
          }
        }
      }
    }
    return y;
  }
  initApp() {
    for (const t of this.listBySelector.keys())
      this.connectBySelector(t, this.componentsRoot);
  }
  connectBucket(t) {
    this.buckets[t.id] = t;
  }
  disconnectBucket(t) {
    delete this.buckets[t.id];
  }
}
const B = new m();
export {
  B as componentsRegistryService
};
//# sourceMappingURL=components-registry.service.js.map
