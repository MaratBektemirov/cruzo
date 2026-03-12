var a = Object.defineProperty;
var p = (o, i, t) => i in o ? a(o, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[i] = t;
var s = (o, i, t) => p(o, typeof i != "symbol" ? i + "" : i, t);
import { c as d, A as h, T as c } from "../component-CH-TJ5VF.js";
function v(o) {
  return Object.assign({}, o);
}
class u extends h {
  constructor() {
    super(...arguments);
    s(this, "hasConfig", !0);
    s(this, "hasOuterScope", !0);
    s(this, "tooltipNode", null);
    s(this, "hasFocus", !1);
    s(this, "hasMouseEnter", !1);
    s(this, "updateTooltipCoords", () => {
      if (!this.tooltipNode) return;
      const t = this.getInput();
      if (!t) return;
      const e = t.getBoundingClientRect();
      this.tooltipNode.style.left = e.left + "px", this.tooltipNode.style.top = e.top - 43 + "px";
    });
  }
  getHTML() {
    return `<input
        let-state="{{this.state$::rx}}"
        attached="{{state}}"
        required="{{state.required}}"
        inputmode="{{state.inputmode}}"
        maxlength="{{state.maxlength}}"
        class="input {{state.cls}}"
        autocomplete="{{state.autocomplete}}"
        type="${this.config.type || "text"}"
        placeholder="{{state.placeholder}}"
        oninput="{{root.onEvent()}}"
        onfocus="{{root.onFocus()}}"
        onblur="{{root.onBlur()}}"
        onmouseenter="{{root.onMouseEnter()}}"
        onmouseleave="{{root.onMouseLeave()}}"
        />`;
  }
  isNumber() {
    var t;
    return ((t = this.getInput()) == null ? void 0 : t.getAttribute("type")) === "number";
  }
  getInput() {
    return this.node.firstElementChild;
  }
  recalc() {
    const t = this.hasFocus || this.hasMouseEnter;
    let e = !1, n = !1, l = !1;
    if (t) {
      const r = this.getInput();
      r && (l = r.scrollWidth > r.offsetWidth, e = !this.tooltipNode && l);
    }
    n = this.tooltipNode && !l, e ? (this.tooltipNode = c.stringToNode('<div class="cruzo-ui-component_input-tooltip"></div>'), document.body.appendChild(this.tooltipNode), this.updateTooltipCoords(), window.addEventListener("resize", this.updateTooltipCoords), window.addEventListener("scroll", this.updateTooltipCoords)) : n && (this.tooltipNode.remove(), this.tooltipNode = null, window.removeEventListener("resize", this.updateTooltipCoords), window.removeEventListener("scroll", this.updateTooltipCoords)), this.tooltipNode && this.updateTooltipText();
  }
  updateTooltipText() {
    const t = this.getInput();
    this.tooltipNode.innerHTML = t.value;
  }
  onEvent() {
    const t = this.getInput();
    let e;
    this.isNumber() ? e = +t.value : e = t.value, this.value !== e && this.outerScope.setValue(this.id, e, this.index, !0);
  }
  onFocus() {
    this.hasFocus = !0, this.recalc();
  }
  onBlur() {
    this.hasFocus = !1, this.recalc();
  }
  onMouseEnter() {
    this.hasMouseEnter = !0, this.recalc();
  }
  onMouseLeave() {
    this.hasMouseEnter = !1, this.recalc();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.tooltipNode && (this.tooltipNode.remove(), this.tooltipNode = null, window.removeEventListener("resize", this.updateTooltipCoords), window.removeEventListener("scroll", this.updateTooltipCoords));
  }
  connectedCallback() {
    super.connectedCallback();
    const t = this.outerScope.getState(this.id, this.index) || {};
    this.outerScope.setState(this.id, {
      required: t.required || this.config.required || !1,
      placeholder: t.placeholder || this.config.placeholder || "",
      cls: t.cls || "",
      maxlength: t.maxlength || this.config.maxlength || "",
      autocomplete: t.autocomplete || this.config.autocomplete || "",
      inputmode: t.inputmode || this.config.inputmode || ""
    }, this.index), this.newRxFunc((e) => {
      const n = this.getInput();
      !n || e === n.value || (n.value = e ?? "");
    }, this.value$);
  }
}
s(u, "selector", "input-component");
d.define(u);
export {
  u as InputComponent,
  v as InputConfig
};
//# sourceMappingURL=input.js.map
