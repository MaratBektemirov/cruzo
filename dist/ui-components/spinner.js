var c = Object.defineProperty;
var r = (e, o, t) => o in e ? c(e, o, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[o] = t;
var n = (e, o, t) => r(e, typeof o != "symbol" ? o + "" : o, t);
import { c as a, A as l, T as u } from "../component-BplwVDE8.js";
var d = /* @__PURE__ */ ((e) => (e.inactive = "inactive", e.active = "active", e))(d || {});
function m(e) {
  return Object.assign({}, e);
}
const h = [
  "inactive"
  /* inactive */
];
class s extends l {
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
        class="cruzo-ui-component_spinner {{root.getCls(value)}}"
        style="{{root.getSpinnerStyle()}}">
        <div class="cruzo-ui-component_spinner-dot cruzo-ui-component_spinner-dot-1"></div>
        <div class="cruzo-ui-component_spinner-dot cruzo-ui-component_spinner-dot-2"></div>
        <div class="cruzo-ui-component_spinner-dot cruzo-ui-component_spinner-dot-3"></div>
      </div>`;
  }
  connectedCallback() {
    super.connectedCallback(), this.syncContentFromState();
  }
  getCls(t) {
    switch (t) {
      case "inactive":
        return "cruzo-ui-component--inactive";
      case "active":
        return "cruzo-ui-component--active";
      default:
        return "cruzo-ui-component--inactive";
    }
  }
  syncContentFromState() {
    h.includes(this.value) || !this.value ? this.destroyContent() : this.ensureContent();
  }
  ensureContent() {
    if (this.contentNode) return;
    this.contentNode = document.createElement("div"), this.contentNode.innerHTML = this.getHTML(), this.contentNode.classList.add("cruzo-ui-component_spinner-wrapper");
    const t = getComputedStyle(this.node), i = t.backgroundImage;
    i.includes("gradient") ? this.contentNode.style.backgroundImage = i : this.contentNode.style.backgroundColor = t.backgroundColor, this.contentNode.style.borderRadius = t.borderRadius, this.ensureHostPositionForOverlay(), this.template = new u({
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
n(s, "selector", '[is="spinner"]');
a.define(s);
export {
  s as SpinnerComponent,
  m as SpinnerConfig,
  d as SpinnerValue
};
//# sourceMappingURL=spinner.js.map
