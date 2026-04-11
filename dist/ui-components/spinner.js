var a = Object.defineProperty;
var c = (e, i, t) => i in e ? a(e, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[i] = t;
var n = (e, i, t) => c(e, typeof i != "symbol" ? i + "" : i, t);
import { c as l, A as d, T as h } from "../component-DBoFvGq8.js";
import { UI_KIT as s } from "./const.js";
var u = /* @__PURE__ */ ((e) => (e.inactive = "inactive", e.active = "active", e))(u || {});
function m(e) {
  return Object.assign({}, e);
}
const p = [
  "inactive"
  /* inactive */
];
class r extends d {
  constructor() {
    super(...arguments);
    n(this, "hasConfig", !0);
    n(this, "hasOuterBucket", !0);
    n(this, "isDirective", !0);
    n(this, "contentNode", null);
    n(this, "hostPositionWasPatched", !1);
    n(this, "hostPrevPosition", "");
  }
  getSpinnerStyle() {
    const t = [];
    return this.config.color && t.push(`--spinner-color:${this.config.color}`), this.config.size && t.push(`--spinner-size:${this.config.size}`), t.join(";");
  }
  getHTML() {
    return `<div let-value="{{root.value$::rx}}"
        class="${s}_spinner {{root.getCls(value)}}"
        style="{{root.getSpinnerStyle()}}">
        <div class="${s}_spinner-dot ${s}_spinner-dot-1"></div>
        <div class="${s}_spinner-dot ${s}_spinner-dot-2"></div>
        <div class="${s}_spinner-dot ${s}_spinner-dot-3"></div>
      </div>`;
  }
  connectedCallback() {
    super.connectedCallback(), this.syncContentFromState();
  }
  getCls(t) {
    switch (t) {
      case "inactive":
        return `${s}--inactive`;
      case "active":
        return `${s}--active`;
      default:
        return `${s}--inactive`;
    }
  }
  syncContentFromState() {
    p.includes(this.value) || !this.value ? this.destroyContent() : this.ensureContent();
  }
  ensureContent() {
    if (this.contentNode) return;
    this.contentNode = document.createElement("div"), this.contentNode.innerHTML = this.getHTML(), this.contentNode.classList.add(`${s}_spinner-wrapper`);
    const t = getComputedStyle(this.node), o = t.backgroundImage;
    o.includes("gradient") ? this.contentNode.style.backgroundImage = o : this.contentNode.style.backgroundColor = t.backgroundColor, this.contentNode.style.borderRadius = t.borderRadius, this.ensureHostPositionForOverlay(), this.template = new h({
      node: this.contentNode,
      self: () => this,
      selector: this.selector,
      __tplFile: this.__tplFile
    }), this.template.detectChanges(), this.node.appendChild(this.contentNode);
  }
  ensureHostPositionForOverlay() {
    getComputedStyle(this.node).position === "static" && (this.hostPositionWasPatched = !0, this.hostPrevPosition = this.node.style.position || "", this.node.style.position = "relative");
  }
  destroyContent() {
    this.template && (this.template.fullDestroy(), this.template = null), this.contentNode && (this.contentNode.remove(), this.contentNode = null), this.hostPositionWasPatched && (this.node.style.position = this.hostPrevPosition, this.hostPositionWasPatched = !1, this.hostPrevPosition = "");
  }
  setValue(t = !1) {
    this.value = this.outerBucket.getValue(this.id, this.index) ?? "inactive", this.value$.update(this.value), this.syncContentFromState();
  }
  disconnectedCallback() {
    this.destroyContent(), super.disconnectedCallback();
  }
}
n(r, "selector", '[is="spinner"]');
l.define(r);
export {
  r as SpinnerComponent,
  m as SpinnerConfig,
  u as SpinnerValue
};
//# sourceMappingURL=spinner.js.map
