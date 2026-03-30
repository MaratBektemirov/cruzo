var o = Object.defineProperty;
var a = (t, i, e) => i in t ? o(t, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[i] = e;
var s = (t, i, e) => a(t, typeof i != "symbol" ? i + "" : i, e);
import { c as h, A as d, T as l } from "../component-CK41B9Gk.js";
import { r as n } from "../router.service-7rnmEkH3.js";
const u = /* @__PURE__ */ new Set(["href"]);
function f(t) {
  return Object.assign({}, t);
}
class r extends d {
  constructor() {
    super();
    s(this, "hasOuterBucket", !0);
    s(this, "hasConfig", !0);
    s(this, "isDirective", !0);
    s(this, "onClick", (e) => {
      const c = this.node.getAttribute("href");
      n.pushHistoryLink(e, c);
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.node.removeEventListener("click", this.onClick);
  }
  onChange() {
    let e = this.config.activeCls;
    const c = this.isActive();
    this.outerBucket.emitEvent(this.id, "routerLinkStateChanged", { data: { isActive: c } }, this.index), c ? this.node.classList.add(e) : this.node.classList.remove(e);
  }
  isActive() {
    return n.hrefIsActive(this.node.getAttribute("href"), this.config);
  }
  connectedCallback() {
    super.connectedCallback(), this.node.addEventListener("click", this.onClick), l.allowAttributeEvent(this.node, u), this.node.addEventListener("onchangeattr", (e) => {
      this.onChange();
    }), this.newRxFunc(() => {
      this.onChange();
    }, n.pathname$, n.hash$, n.search$);
  }
}
s(r, "selector", "[router-link]");
h.define(r);
export {
  r as RouterLinkComponent,
  f as RouterLinkConfig
};
//# sourceMappingURL=router-link.js.map
