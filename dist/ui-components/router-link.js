var r = Object.defineProperty;
var h = (t, n, e) => n in t ? r(t, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[n] = e;
var i = (t, n, e) => h(t, typeof n != "symbol" ? n + "" : n, e);
import { componentsRegistryService as a, AbstractComponent as d, routerService as s, Template as l } from "cruzo";
const u = /* @__PURE__ */ new Set(["href"]);
function g(t = {}) {
  return { activeCls: "", ...t };
}
class c extends d {
  constructor() {
    super();
    i(this, "hasOuterBucket", !0);
    i(this, "hasConfig", !0);
    i(this, "isDirective", !0);
    i(this, "onClick", (e) => {
      const o = this.node.getAttribute("href");
      s.pushHistoryLink(e, o);
    });
    i(this, "onHashChangeForActive", () => {
      s.isHashMode() || this.onChange();
    });
  }
  disconnectedCallback() {
    window.removeEventListener("hashchange", this.onHashChangeForActive), super.disconnectedCallback(), this.node.removeEventListener("click", this.onClick);
  }
  onChange() {
    const e = this.config.activeCls ?? "", o = this.isActive();
    this.outerBucket.emitEvent(this.id, "routerLinkStateChanged", { data: { isActive: o } }, this.index), e && (o ? this.node.classList.add(e) : this.node.classList.remove(e));
  }
  isActive() {
    return s.hrefIsActive(this.node.getAttribute("href"), this.config);
  }
  connectedCallback() {
    super.connectedCallback(), this.node.addEventListener("click", this.onClick), l.allowAttributeEvent(this.node, u), this.node.addEventListener("onchangeattr", (e) => {
      this.onChange();
    }), window.addEventListener("hashchange", this.onHashChangeForActive), this.newRxFunc(() => {
      this.onChange();
    }, s.pathname$, s.search$);
  }
}
i(c, "selector", "[router-link]");
a.define(c);
export {
  c as RouterLinkComponent,
  g as RouterLinkConfig
};
//# sourceMappingURL=router-link.js.map
