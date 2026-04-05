var c = Object.defineProperty;
var a = (t, n, e) => n in t ? c(t, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[n] = e;
var i = (t, n, e) => a(t, typeof n != "symbol" ? n + "" : n, e);
import { c as h, A as d, T as l } from "../component-CK41B9Gk.js";
import { r as s } from "../router.service-D899kAWK.js";
const u = /* @__PURE__ */ new Set(["href"]);
function f(t = {}) {
  return { activeCls: "", ...t };
}
class r extends d {
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
i(r, "selector", "[router-link]");
h.define(r);
export {
  r as RouterLinkComponent,
  f as RouterLinkConfig
};
//# sourceMappingURL=router-link.js.map
