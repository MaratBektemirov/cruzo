var r = Object.defineProperty;
var a = (t, i, e) => i in t ? r(t, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[i] = e;
var n = (t, i, e) => a(t, typeof i != "symbol" ? i + "" : i, e);
import { componentsRegistryService as h, AbstractComponent as d, routerService as s, Template as l } from "cruzo";
const u = /* @__PURE__ */ new Set(["href"]);
function f(t) {
  return Object.assign({}, t);
}
class o extends d {
  constructor() {
    super();
    n(this, "hasOuterScope", !0);
    n(this, "hasConfig", !0);
    n(this, "isDirective", !0);
    n(this, "onClick", (e) => {
      const c = this.node.getAttribute("href");
      s.pushHistoryLink(e, c);
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.node.removeEventListener("click", this.onClick);
  }
  onChange() {
    let e = this.config.activeCls;
    const c = this.isActive();
    this.outerScope.emitEvent(this.id, this.index, "routerLinkStateChanged", { data: { isActive: c } }), c ? this.node.classList.add(e) : this.node.classList.remove(e);
  }
  isActive() {
    return s.hrefIsActive(this.node.getAttribute("href"), this.config);
  }
  connectedCallback() {
    super.connectedCallback(), this.node.addEventListener("click", this.onClick), l.allowAttributeEvent(this.node, u), this.node.addEventListener("onchangeattr", (e) => {
      this.onChange();
    }), this.newRxFunc(() => {
      this.onChange();
    }, s.pathname$, s.hash$, s.search$);
  }
}
n(o, "selector", "[router-link]");
h.define(o);
export {
  o as RouterLinkComponent,
  f as RouterLinkConfig
};
//# sourceMappingURL=router-link.js.map
